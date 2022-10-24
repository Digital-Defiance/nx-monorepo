import { randomBytes } from 'crypto';
import BrightChainMember from '../brightChainMember';
import BrightChainMemberType from '../memberType';
import StaticHelpers from '../staticHelpers';
import StaticHelpersChecksum from '../staticHelpers.checksum';
import Block from './block';
import BlockSize, { blockSizeToLength, blockSizes } from './blockSizes';

class TraceBreadCrumb {
  public static readonly traceLog: Array<TraceBreadCrumb> = [];
  public readonly date: Date;
  public readonly functionName: string;
  public readonly functionArgs: Array<any>;
  constructor(functionName: string, ...args: Array<any>) {
    this.date = new Date();
    this.functionName = functionName;
    this.functionArgs = args;
    TraceBreadCrumb.traceLog.push(this);
  }
  public static trace(functionName: string, ...args: Array<any>): TraceBreadCrumb {
    return new TraceBreadCrumb(functionName, ...args);
  }
  public trace(...args: Array<any>): TraceBreadCrumb {
    return new TraceBreadCrumb(this.functionName, ...args);
  }
  public deeperTrace(functionName: string, ...args: Array<any>): TraceBreadCrumb {
    return new TraceBreadCrumb([this.functionName,functionName].join('>'), ...args);
  }
}
const pTrace = TraceBreadCrumb.trace('block.spec.ts');

function randomBlockSize(): BlockSize {
  pTrace.deeperTrace('randomBlockSize');
  // need to skip unknown block size
  const blockIndex = 1 + Math.floor(Math.random() * (blockSizes.length - 1));
  return blockSizes[blockIndex];
}

const alice = BrightChainMember.newMember(
  BrightChainMemberType.User,
  'alice',
  'alice@example.com'
);
pTrace.trace('alice created', alice);
const bob = BrightChainMember.newMember(
  BrightChainMemberType.User,
  'bob',
  'bob@example.com'
);
pTrace.trace('bob created', bob);

describe('block', () => {
  const blockTrace = pTrace.deeperTrace('describe block');
  it('should create a block', (done) => {
    const itTrace= blockTrace.deeperTrace('it should create a block');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize));
    const checksum = StaticHelpersChecksum.calculateChecksum(Buffer.from(data));
    const dateCreated = new Date();
    const block = new Block(alice, data, dateCreated);
    itTrace.trace('block created');
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
    itTrace.trace('returning from test')
  });
  it('should convert a block to json and back', (done) => {
    const itTrace = blockTrace.deeperTrace('it should convert a block to json and back');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize));
    const checksum = StaticHelpersChecksum.calculateChecksum(Buffer.from(data));
    const dateCreated = new Date();
    const block = new Block(alice, data, dateCreated, checksum);
    itTrace.trace('block created');
    const json = block.toJSON();
    itTrace.trace('block converted to json');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rebuiltBlock = Block.fromJSON(json, (memberId: Uint8Array) => alice);
    itTrace.trace('block rebuilt from json');
    expect(rebuiltBlock).toBeTruthy();
    expect(rebuiltBlock.blockSize).toBe(block.blockSize);
    expect(rebuiltBlock.data).toEqual(block.data);
    expect(rebuiltBlock.id).toEqual(block.id);
    expect(rebuiltBlock.createdBy).toEqual(block.createdBy);
    expect(rebuiltBlock.createdById).toEqual(block.createdById);
    expect(rebuiltBlock.dateCreated).toEqual(block.dateCreated);
    itTrace.trace('returning from test')
  });
  it('should convert a block to json and fail to convert back with a bad member source', (done) => {
    const itTrace = blockTrace.deeperTrace('it should convert a block to json and fail to convert back with a bad member source');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize));
    const checksum = StaticHelpersChecksum.calculateChecksum(Buffer.from(data));
    const dateCreated = new Date();
    const block = new Block(alice, data, dateCreated, checksum);
    itTrace.trace('block created');
    const json = block.toJSON();
    itTrace.trace('block converted to json');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expect(() => Block.fromJSON(json, (memberId: Uint8Array) => bob)).toThrow(
      'Member mismatch'
    );
    itTrace.trace('returning from test')
  });
  it('should throw when given a bad checksum', (done) => {
    const itTrace = blockTrace.deeperTrace('it should throw when given a bad checksum');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize));
    const dateCreated = new Date();
    const badData = randomBytes(blockSizeToLength(blockSize));
    const badChecksum = StaticHelpersChecksum.calculateChecksum(
      Buffer.from(badData)
    );
    itTrace.trace('block data generated, creating block with checksum mismatch')
    expect(() => new Block(alice, data, dateCreated, badChecksum)).toThrow(
      'Checksum mismatch'
    );
    itTrace.trace('returning from test')
  });
  it('should throw when making an empty block', (done) => {
    const itTrace = blockTrace.deeperTrace('it should throw when making an empty block');
    const data = Buffer.from(new Uint8Array());
    const dateCreated = new Date();
    expect(() => new Block(alice, data, dateCreated)).toThrow(
      `Data length ${data.length} is not a valid block size`
    );
    itTrace.trace('returning from test')
  });
  it('should throw when making a block of a bad size', (done) => {
    const itTrace = blockTrace.deeperTrace('it should throw when making a block of a bad size');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize) + 1);
    const dateCreated = new Date();
    expect(() => new Block(alice, data, dateCreated)).toThrow(
      `Data length ${data.length} is not a valid block size`
    );
    itTrace.trace('returning from test')
  });
  it('should make dateCreated valus when not provided', (done) => {
    const itTrace = blockTrace.deeperTrace('it should make dateCreated valus when not provided');
    const blockSize = randomBlockSize();
    const data = randomBytes(blockSizeToLength(blockSize));
    const checksum = StaticHelpersChecksum.calculateChecksum(Buffer.from(data));
    const dateCreated = new Date();
    const block = new Block(alice, data, undefined, checksum);
    itTrace.trace('block created');
    expect(block.dateCreated).toBeTruthy();
    expect(block.dateCreated).toBeInstanceOf(Date);
    // the difference between the dateCreated call and the block dateCreated should be far less than 1 second
    const delta = Math.abs(block.dateCreated.getTime() - dateCreated.getTime());
    expect(delta).toBeLessThan(1000);
    expect(delta).toBeGreaterThanOrEqual(0);
    itTrace.trace('returning from test')
  });
  it('should not xor with different block sizes', (done) => {
    const itTrace = blockTrace.deeperTrace('it should not xor with different block sizes');
    const blockA = new Block(alice, randomBytes(BlockSize.Tiny), new Date());
    itTrace.trace('blockA created');
    const blockB = new Block(alice, randomBytes(BlockSize.Nano), new Date());
    itTrace.trace('blockB created');
    expect(() => blockA.xor(blockB, alice)).toThrow('Block sizes do not match');
    itTrace.trace('returning from test')
  });
  it('should xor with same block sizes', (done) => {
    const itTrace = blockTrace.deeperTrace('it should xor with same block sizes');
    const blockLength: number = BlockSize.Nano;
    const blockA = new Block(alice, randomBytes(blockLength), new Date());
    itTrace.trace('blockA created');
    const blockB = new Block(alice, randomBytes(blockLength), new Date());
    itTrace.trace('blockB created');
    const blockC = blockA.xor(blockB, alice);
    itTrace.trace('blockC created');
    const expectedData = Buffer.alloc(blockLength);
    for (let i = 0; i < blockLength; i++) {
      expectedData[i] = blockA.data[i] ^ blockB.data[i];
    }
    expect(blockC.data).toEqual(expectedData);
    expect(blockC.createdBy).toEqual(alice.id);
    expect(blockC.id).toEqual(
      Buffer.from(StaticHelpersChecksum.calculateChecksum(expectedData))
    );
    itTrace.trace('returning from test')
  });
});
