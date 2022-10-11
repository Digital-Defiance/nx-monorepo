import { IShamirShareDetail } from './interfaces';
import { extractShareComponents, getConfig } from 'secrets.js-34r7h';

export default class ShamirShareDetail implements IShamirShareDetail {
  public readonly share: string;
  public readonly bits: number;
  public readonly id: number;
  public readonly data: string;
  public dataAsBuffer(): Buffer {
    return Buffer.from(this.data, 'hex');
  }
  public dataAsBigInt(): bigint {
    return BigInt('0x' + this.data);
  }
  public dataAsNumber(): number {
    return Number('0x' + this.data);
  }
  constructor(share: string, bits: number, id: number, data: string) {
    this.share = share;
    this.bits = bits;
    this.id = id;
    this.data = data;
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
}
