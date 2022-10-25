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
const pTrace = HanselGretelBreadCrumbTrail.addCrumb(traceLog, 'block.spec.ts');

function randomBlockSize(): BlockSize {
  pTrace.forkAndAddCrumb('randomBlockSize');
  // need to skip unknown block size
  const blockIndex = 1 + Math.floor(Math.random() * (blockSizes.length - 1));
  return blockSizes[blockIndex];
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

const blockTrace = pTrace.forkAndAddCrumbWithCallback(
  'describe block',
  (): HanselGretelBreadCrumbTrail => {
    describe('block', () => {
      it('should create a block', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should create a block',
          () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated);
            itTrace.addCrumb('block created');
            expect(block).toBeTruthy();
            expect(block.blockSize).toBe(blockSize);
            expect(block.data).toEqual(data);
            expect(block.id).toEqual(checksum);
            expect(block.checksumString).toEqual(checksum.toString('hex'));
            expect(block.createdBy).toEqual(alice.id);
            expect(block.createdById).toEqual(
              StaticHelpers.Uint8ArrayToUuidV4(alice.id)
            );
            expect(block.dateCreated).toEqual(dateCreated);
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should convert a block to json and back', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should convert a block to json and back',
          (result: HanselGretelBreadCrumbTrail) => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated, checksum);
            itTrace.addCrumb('block created');
            const json = block.toJSON();
            itTrace.addCrumb('block converted to json');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const rebuiltBlock = Block.fromJSON(
              json,
              (memberId: Uint8Array) => alice
            );
            itTrace.addCrumb('block rebuilt from json');
            expect(rebuiltBlock).toBeTruthy();
            expect(rebuiltBlock.blockSize).toBe(block.blockSize);
            expect(rebuiltBlock.data).toEqual(block.data);
            expect(rebuiltBlock.id).toEqual(block.id);
            expect(rebuiltBlock.createdBy).toEqual(block.createdBy);
            expect(rebuiltBlock.createdById).toEqual(block.createdById);
            expect(rebuiltBlock.dateCreated).toEqual(block.dateCreated);
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should convert a block to json and fail to convert back with a bad member source', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should convert a block to json and fail to convert back with a bad member source',
          (result: HanselGretelBreadCrumbTrail) => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const dateCreated = new Date();
            const block = new Block(alice, data, dateCreated, checksum);
            itTrace.addCrumb('block created');
            const json = block.toJSON();
            itTrace.addCrumb('block converted to json');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            expect(() =>
              Block.fromJSON(json, (memberId: Uint8Array) => bob)
            ).toThrow('Member mismatch');
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should throw when given a bad checksum', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should throw when given a bad checksum',
          (result: HanselGretelBreadCrumbTrail) => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const dateCreated = new Date();
            const badData = randomBytes(blockSizeToLength(blockSize));
            const badChecksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(badData)
            );
            itTrace.addCrumb(
              'block data generated, creating block with checksum mismatch'
            );
            expect(
              () => new Block(alice, data, dateCreated, badChecksum)
            ).toThrow('Checksum mismatch');
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should throw when making an empty block', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should throw when making an empty block',
          () => {
            const data = Buffer.from(new Uint8Array());
            const dateCreated = new Date();
            expect(() => new Block(alice, data, dateCreated)).toThrow(
              `Data length ${data.length} is not a valid block size`
            );
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should throw when making a block of a bad size', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should throw when making a block of a bad size',
          () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize) + 1);
            const dateCreated = new Date();
            expect(() => new Block(alice, data, dateCreated)).toThrow(
              `Data length ${data.length} is not a valid block size`
            );
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should make dateCreated valus when not provided', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should make dateCreated valus when not provided',
          () => {
            const blockSize = randomBlockSize();
            const data = randomBytes(blockSizeToLength(blockSize));
            const checksum = StaticHelpersChecksum.calculateChecksum(
              Buffer.from(data)
            );
            const dateCreated = new Date();
            const block = new Block(alice, data, undefined, checksum);
            itTrace.addCrumb('block created');
            expect(block.dateCreated).toBeTruthy();
            expect(block.dateCreated).toBeInstanceOf(Date);
            // the difference between the dateCreated call and the block dateCreated should be far less than 1 second
            const delta = Math.abs(
              block.dateCreated.getTime() - dateCreated.getTime()
            );
            expect(delta).toBeLessThan(1000);
            expect(delta).toBeGreaterThanOrEqual(0);
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should not xor with different block sizes', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should not xor with different block sizes',
          () => {
            const blockA = new Block(
              alice,
              randomBytes(BlockSize.Tiny),
              new Date()
            );
            itTrace.addCrumb('blockA created');
            const blockB = new Block(
              alice,
              randomBytes(BlockSize.Nano),
              new Date()
            );
            itTrace.addCrumb('blockB created');
            expect(() => blockA.xor(blockB, alice)).toThrow(
              'Block sizes do not match'
            );
            return itTrace.addCrumb('returning from test');
          }
        );
      });
      it('should xor with same block sizes', () => {
        const itTrace = blockTrace.forkAndAddCrumbWithCallback(
          'it should xor with same block sizes',
          () => {
            const blockLength: number = BlockSize.Nano;
            const blockA = new Block(
              alice,
              randomBytes(blockLength),
              new Date()
            );
            itTrace.addCrumb('blockA created');
            const blockB = new Block(
              alice,
              randomBytes(blockLength),
              new Date()
            );
            itTrace.addCrumb('blockB created');
            const blockC = blockA.xor(blockB, alice);
            itTrace.addCrumb('blockC created');
            const expectedData = Buffer.alloc(blockLength);
            for (let i = 0; i < blockLength; i++) {
              expectedData[i] = blockA.data[i] ^ blockB.data[i];
            }
            expect(blockC.data).toEqual(expectedData);
            expect(blockC.createdBy).toEqual(alice.id);
            expect(blockC.id).toEqual(
              Buffer.from(StaticHelpersChecksum.calculateChecksum(expectedData))
            );
            return itTrace.addCrumb('returning from test');
          }
        );
      });
    });
    return pTrace.addCrumbWithCallback(
      (result: HanselGretelBreadCrumbTrail) => {
        console.log(traceLog);
        return result;
      },
      'returning from all tests'
    );
  }
);
