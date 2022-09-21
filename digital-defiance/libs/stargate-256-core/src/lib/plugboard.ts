import Rand from "rand-seed";
import { randChoice, randomBigint } from "./util";
import SymbolMapping from "./symbolMapping";
import SymbolMapType from "./symbolMapType";

/**
 * A plugboard has 256 symbols and swaps each symbol with another symbol.
 * offset is ignored on plugboards and they do not rotate
 */
export default class Plugboard extends SymbolMapping {
  constructor(pairs: Uint8Array) {
    super(pairs, 0, SymbolMapType.Plugboard);
  }
  public static defaultStraightThrough(): Plugboard {
    const mapping = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      mapping[i] = i;
    }
    return new Plugboard(mapping);
  }

  public static fromSeed(seed: number | bigint): Plugboard {
    const xorShift = new Rand(seed.toString());
    const availableSymbolsRight = new Set<number>();
    for (let i = 0; i < 256; i++) {
      availableSymbolsRight.add(i);
    }

    const pairs = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      const rightValue = randChoice(
        Array.from(availableSymbolsRight),
        xorShift
      );
      availableSymbolsRight.delete(rightValue);
      pairs[i] = rightValue;
    }
    return new Plugboard(pairs);
  }

  public static fromRandomSeed(): Plugboard {
    return Plugboard.fromSeed(randomBigint());
  }

  public reverse(offset?: number): Plugboard {
    return super.reverse(offset) as Plugboard;
  }

  public override toString(forceType?: SymbolMapType): string {
    const type = forceType ?? SymbolMapType.Plugboard;
    return super.toString(type);
  }

  public static override fromString(
    str: string,
    type?: SymbolMapType
  ): Plugboard {
    return super.fromString(str, type ?? SymbolMapType.Plugboard) as Plugboard;
  }
}
