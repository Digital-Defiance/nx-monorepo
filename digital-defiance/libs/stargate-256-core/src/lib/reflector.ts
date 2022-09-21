import Rotor from "./rotor";
import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import SymbolMapType from "./symbolMapType";
import { randomBigint } from "./util";

/**
 * @description A reflector has 256 symbols and swaps each symbol with another symbol.
 */
export default class Reflector extends Rotor {
  constructor(symbols: Uint8Array | Array<number>, offset: number) {
    super(symbols, offset, SymbolMapType.Reflector);
  }
  public static reflectorA(offset?: number): Reflector {
    return new Reflector(
      partByPartType(SuppliedPartType.ReflectorA).symbols,
      offset ? offset : 0
    );
  }
  public static override fromSeed(
    seed: number | bigint,
    offset: number
  ): Reflector {
    return super.fromSeed(seed, offset) as Reflector;
  }

  public static override fromRandomSeed(offset: number): Reflector {
    return super.fromSeed(randomBigint(), offset) as Reflector;
  }

  public static straightThroughReflector(offset: number): Reflector {
    const symbols = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      symbols[i] = i;
    }
    return new Reflector(symbols, offset);
  }

  public override toString(forceType?: SymbolMapType): string {
    return super.toString(forceType ?? SymbolMapType.Reflector);
  }

  public static override fromString(
    str: string,
    type?: SymbolMapType
  ): Reflector {
    return super.fromString(str, type ?? SymbolMapType.Reflector) as Reflector;
  }

  public override reverse(offset?: number | undefined): Reflector {
    return super.reverse(offset) as Reflector;
  }
}
