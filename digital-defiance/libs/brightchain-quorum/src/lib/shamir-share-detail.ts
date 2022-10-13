import { IShamirShareDetail } from './interfaces';
import { extractShareComponents, getConfig } from 'secrets.js-34r7h';

export default class ShamirShareDetail implements IShamirShareDetail {

  constructor(
    public readonly share: string, 
    public readonly bits: number, 
    public readonly id: number, 
    public readonly data: string
  ) { }

  public dataAsBuffer(): Buffer {
    return Buffer.from(this.data, 'hex');
  }

  public dataAsBigInt(): bigint {
    return BigInt('0x' + this.data);
  }

  public dataAsNumber(): number {
    return Number('0x' + this.data);
  }

  public static fromShare(share: string): ShamirShareDetail {
    const components = extractShareComponents(share);
    return new ShamirShareDetail(
      share,
      components.bits,
      components.id,
      components.data
    );
  }

  public dictionaryIndex(dictionaryWords: Array<string>): number {
    // data point we end up with 64 bytes per share in a 2048 word dictionary with 24 shares
    // as a bigint, this is 2^512 (512 bits) compared to the 2^11=2048 (11 bits)
    // in order to get a unique index, we need to divide the 512 bits by 11 bits
    const bitsPerDictionaryWord = Math.log2(dictionaryWords.length); // 11
    const bitsPerShare = (this.data.length / 2) * 8; // data is hex 128 chars / 2 chars per byte = 64 bytes, 8 bits per byte = 512 bits
    // so 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF >> (512 - 11) = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
    return Number(
      (this.dataAsBigInt() >> BigInt(bitsPerShare - bitsPerDictionaryWord)) ^
        0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn
    );
  }
}
