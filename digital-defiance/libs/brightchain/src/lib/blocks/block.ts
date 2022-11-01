import BrightChainMember from '../brightChainMember';
import { FullHexGuid, toFullHexFromBigInt } from '../guid';
import { IReadOnlyDataObject } from '../interfaces';
import StaticHelpersChecksum from '../staticHelpers.checksum';
import BlockSize, { lengthToBlockSize, validateBlockSize } from './blockSizes';

export default class Block implements IReadOnlyDataObject {
  constructor(
    creator: BrightChainMember,
    data: Uint8Array,
    dateCreated?: Date,
    checksum?: bigint
  ) {
    this.createdBy = creator.id;
    if (!validateBlockSize(data.length)) {
      throw new Error(`Data length ${data.length} is not a valid block size`);
    }
    this.data = Buffer.from(data);
    const rawChecksum = StaticHelpersChecksum.calculateChecksum(
      Buffer.from(data)
    );
    this.id = BigInt('0x' + rawChecksum.toString('hex'));

    if (checksum !== undefined && this.id !== checksum) {
      throw new Error('Checksum mismatch');
    }
    this.dateCreated = dateCreated ?? new Date();
  }
  public readonly id: bigint;
  public get blockSize(): BlockSize {
    return lengthToBlockSize(this.data.length);
  }
  public readonly data: Uint8Array;
  public get checksumString() {
    return this.id.toString(16);
  }
  public readonly createdBy: bigint;
  public get createdById(): FullHexGuid {
    return toFullHexFromBigInt(this.createdBy);
  }
  public readonly dateCreated: Date;
  public xor(other: Block, agent: BrightChainMember): Block {
    if (this.blockSize !== other.blockSize) {
      throw new Error('Block sizes do not match');
    }
    const data = new Uint8Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
      data[i] = this.data[i] ^ other.data[i];
    }
    return new Block(agent, data);
  }
  public toJSON(): string {
    return JSON.stringify({
      id: this.id.toString(16),
      data: Buffer.from(this.data).toString('hex'),
      createdBy: this.createdBy.toString(16),
      dateCreated: this.dateCreated,
    });
  }
  public static fromJSON(
    json: string,
    fetchMember: (memberId: bigint) => BrightChainMember
  ): Block {
    const parsed = JSON.parse(json);
    const parsedMemberId = BigInt('0x' + parsed.createdBy);
    const data = Buffer.from(parsed.data, 'hex');
    const dateCreated = new Date(parsed.dateCreated);
    const parsedBlockId = BigInt('0x' + parsed.id);
    const member = fetchMember(parsedMemberId);
    if (member.id != parsedMemberId) {
      throw new Error('Member mismatch');
    }
    return new Block(member, data, dateCreated, parsedBlockId);
  }
}
