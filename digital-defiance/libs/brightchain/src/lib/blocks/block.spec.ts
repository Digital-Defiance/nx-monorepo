import { randomBytes } from 'crypto';
import BrightChainMember from '../brightChainMember';
import BrightChainMemberType from '../memberType';
import StaticHelpers from '../staticHelpers';
import StaticHelpersChecksum from '../staticHelpers.checksum';
import Block from './block';
import BlockSize, { blockSizeToLength, blockSizes } from './blockSizes';

import {
  IBreadCrumbTrace,
  HanselGretelBreadCrumbTrail,
} from '../HanselGretelBreadCrumbTrail';
const traceLog: Array<IBreadCrumbTrace> = [];
const pTrace = HanselGretelBreadCrumbTrail.addCrumb(true, traceLog, 'block.spec.ts');

function randomBlockSize(): BlockSize {
  pTrace.forkAndAddCrumb('randomBlockSize');
  // how about we actually reduce the set to one fow now.
  // TODO: determine deadlock/speed issues?
  return BlockSize.Tiny;
  // // need to skip unknown block size
  // const blockIndex = 1 + Math.floor(Math.random() * (blockSizes.length - 1));
  // return blockSizes[blockIndex];
}

const alice = BrightChainMember.newMember(
  BrightChainMemberType.User,
  'alice',
  'alice@example.com'
);
pTrace.addCrumb('alice created', alice);
const bob = BrightChainMember.newMember(
  BrightChainMemberType.User,
  'bob',
  'bob@example.com'
);
pTrace.addCrumb('bob created', bob);

describe('block', () => {
  pTrace.forkAndAddCrumbWithCallback(
    'describe block',
    (result: HanselGretelBreadCrumbTrail): HanselGretelBreadCrumbTrail => {
      result.forkAndAddCrumbWithCallback(
        'it should create a block',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should create a block', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated);
            result.addCrumb('block created');
            expect(block).toBeTruthy();
            expect(block.blockSize).toBe(blockSize);
            expect(block.data).toEqual(data);
            expect(block.id).toEqual(checksum);
            expect(block.checksumString).toEqual(checksum.toString('hex'));
            expect(block.createdBy).toEqual(alice.id);
            expect(block.createdById).toEqual(alice.id.toString(16));
            expect(block.dateCreated).toEqual(dateCreated);
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should convert a block to json and back',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should convert a block to json and back', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const checksumBigInt = BigInt('0x' + checksum.toString('hex'));
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated, checksumBigInt);
            result.addCrumb('block created');
            const json = block.toJSON();
            result.addCrumb('block converted to json');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const rebuiltBlock = Block.fromJSON(
              json,
              (memberId: bigint) => alice
            );
            result.addCrumb('block rebuilt from json');
            expect(rebuiltBlock).toBeTruthy();
            expect(rebuiltBlock.blockSize).toBe(block.blockSize);
            expect(rebuiltBlock.data).toEqual(block.data);
            expect(rebuiltBlock.id).toEqual(block.id);
            expect(rebuiltBlock.createdBy).toEqual(block.createdBy);
            expect(rebuiltBlock.createdById).toEqual(block.createdById);
            expect(rebuiltBlock.dateCreated).toEqual(block.dateCreated);
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should convert a block to json and fail to convert back with a bad member source',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should convert a block to json and fail to convert back with a bad member source', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const checksumBigInt = BigInt('0x' + checksum.toString('hex'));
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated, checksumBigInt);
            result.addCrumb('block created');
            const json = block.toJSON();
            result.addCrumb('block converted to json');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            expect(() =>
              Block.fromJSON(json, (memberId: bigint) => bob)
            ).toThrow('Member mismatch');
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should throw when given a bad checksum',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should throw when given a bad checksum', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const dateCreated = new Date();
            const badData = randomBytes(blockSizeToLength(blockSize));
            const badChecksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(badData)
            );
            const badChecksumBigInt = BigInt('0x' + badChecksum.toString('hex'));
            result.addCrumb(
              'block data generated, creating block with checksum mismatch'
            );
            expect(
              () => new Block(alice, data, dateCreated, badChecksumBigInt)
            ).toThrow('Checksum mismatch');
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should throw when making an empty block',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should throw when making an empty block', () => {
            const data = Buffer.from(new Uint8Array());
            const dateCreated = new Date();
            expect(() => new Block(alice, data, dateCreated)).toThrow(
              `Data length ${data.length} is not a valid block size`
            );
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should throw when making a block of a bad size',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should throw when making a block of a bad size', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize) + 1);
            const dateCreated = new Date();
            expect(() => new Block(alice, data, dateCreated)).toThrow(
              `Data length ${data.length} is not a valid block size`
            );
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should make dateCreated valus when not provided',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should make dateCreated valus when not provided', () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const checksumBigInt = BigInt('0x' + checksum.toString('hex'));
            const dateCreated = new Date();
            const block = new Block(alice, data, undefined, checksumBigInt);
            result.addCrumb('block created');
            expect(block.dateCreated).toBeTruthy();
            expect(block.dateCreated).toBeInstanceOf(Date);
            // the difference between the dateCreated call and the block dateCreated should be far less than 1 second
            const delta = Math.abs(
              block.dateCreated.getTime() - dateCreated.getTime()
            );
            expect(delta).toBeLessThan(1000);
            expect(delta).toBeGreaterThanOrEqual(0);
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should not xor with different block sizes',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should not xor with different block sizes', () => {
            const blockA = new Block(
              alice,
              randomBytes(BlockSize.Tiny),
              new Date()
            );
            result.addCrumb('blockA created');
            const blockB = new Block(
              alice,
              randomBytes(BlockSize.Nano),
              new Date()
            );
            result.addCrumb('blockB created');
            expect(() => blockA.xor(blockB, alice)).toThrow(
              'Block sizes do not match'
            );
          });
          return result.addCrumb('returning from test');
        }
      );
      result.forkAndAddCrumbWithCallback(
        'it should xor with same block sizes',
        (result: HanselGretelBreadCrumbTrail) => {
          it('should xor with same block sizes', () => {
            const blockLength: number = BlockSize.Nano;
            const blockA = new Block(
              alice,
              randomBytes(blockLength),
              new Date()
            );
            result.addCrumb('blockA created');
            const blockB = new Block(
              alice,
              randomBytes(blockLength),
              new Date()
            );
            result.addCrumb('blockB created');
            const blockC = blockA.xor(blockB, alice);
            result.addCrumb('blockC created');
            const expectedData = Buffer.alloc(blockLength);
            for (let i = 0; i < blockLength; i++) {
              expectedData[i] = blockA.data[i] ^ blockB.data[i];
            }
            expect(blockC.data).toEqual(expectedData);
            expect(blockC.createdBy).toEqual(alice.id);
            expect(blockC.id).toEqual(
              Buffer.from(StaticHelpersChecksum.calculateChecksum(expectedData))
            );
          });
          return result.addCrumb('returning from test');
        }
      );
      return pTrace.addCrumbWithCallback(
        (result: HanselGretelBreadCrumbTrail) => {
          console.log(traceLog);
          return result;
        },
        'returning from all tests'
      );
    }
  );
});
