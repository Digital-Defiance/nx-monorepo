import BrightChainMember from '../brightChainMember';
import { FullHexGuid, toFullHexFromBigInt, toFullHexGuid } from '../guid';
import { IReadOnlyDataObjectDTO } from '../interfaces';
import StaticHelpersChecksum from '../staticHelpers.checksum';
import BlockSize, { lengthToBlockSize, validateBlockSize } from './blockSizes';

export default class Block implements IReadOnlyDataObjectDTO {
  constructor(
    creator: BrightChainMember,
    data: Uint8Array,
    dateCreated?: Date,
    checksum?: string
  ) {
    this.createdBy = creator.id;
    if (!validateBlockSize(data.length)) {
      throw new Error(`Data length ${data.length} is not a valid block size`);
    }
    this.data = Buffer.from(data);
    const rawChecksum = StaticHelpersChecksum.calculateChecksum(
      Buffer.from(data)
    );
    this.id = rawChecksum.toString('hex');

    if (checksum !== undefined && this.id !== checksum) {
      throw new Error('Checksum mismatch');
    }
    this.dateCreated = dateCreated ?? new Date();
  }

  public readonly id: string;
  public get blockSize(): BlockSize {
    return lengthToBlockSize(this.data.length);
  }
  public readonly data: Uint8Array;
  public get checksumString() {
    return this.id;
  }
  public readonly createdBy: FullHexGuid;
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
      id: this.id,
      data: Buffer.from(this.data).toString('hex'),
      createdBy: this.createdBy as string,
      dateCreated: this.dateCreated,
    });
  }
  public static fromJSON(
    json: string,
    fetchMember: (memberId: FullHexGuid) => BrightChainMember
  ): Block {
    const parsed = JSON.parse(json) as {
      id: string;
      data: string;
      createdBy: string;
      dateCreated: Date;
    };
    const data = Buffer.from(parsed.data, 'hex');
    const dateCreated = new Date(parsed.dateCreated);
    try {
      const memberId = toFullHexGuid(parsed.createdBy);
      const member = fetchMember(memberId);
      if (member.id != memberId) {
        throw new Error('Member mismatch');
      }
      return new Block(member, data, dateCreated, parsed.id);
    } catch (e) {
      throw new Error('Member mismatch');
    }
  }
}
