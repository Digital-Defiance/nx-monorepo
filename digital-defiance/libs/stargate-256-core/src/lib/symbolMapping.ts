import { randChoice, randomBigint } from "./util";
import Rand from "rand-seed";
import { sha256 } from "hash.js";
import SymbolMapType, {
  SymbolMapTypeCharacters,
  SymbolMapTypeData,
  SymbolMapTypes,
} from "./symbolMapType";
import { ISymbolMapTypeDatum } from "./interfaces";

export default class SymbolMapping {
  public readonly symbols: Uint8Array;
  public readonly classType: SymbolMapType;

  protected _offset: number;
  public get offset(): number {
    return this._offset;
  }
  public set offset(v: number) {
    this._offset = v;
  }

  public symbolIndex(symbol: number): number {
    return this.symbols.indexOf(symbol);
  }

  public symbolAt(index: number): number {
    return this.symbols[index];
  }

  public constructor(
    symbols: Uint8Array | Array<number>,
    initialOffset: number,
    classType: SymbolMapType
  ) {
    if (symbols instanceof Uint8Array) {
      this.symbols = symbols;
    } else {
      this.symbols = new Uint8Array(symbols);
    }
    if (this.symbols.length !== 256) {
      throw new Error(
        "Invalid rotor symbols length (" + this.symbols.length + ")"
      );
    }
    if (!this.validateSymbols()) {
      throw new Error("mapping symbols are invalid");
    }
    if (initialOffset < 0 || initialOffset >= this.symbols.length) {
      throw new Error(
        `Initial offset ${initialOffset} is out of range [0, ${this.symbols.length})`
      );
    }

    this._offset = initialOffset;
    this.classType = classType;
  }

  public get checksum(): string {
    // calculate sha256 checksum
    const hash = sha256();
    hash.update(this.symbols);
    return hash.digest("hex");
  }

  public validateSymbols(): boolean {
    if (this.symbols.length != 256) {
      throw new Error("mapping must have 256 symbols");
    }
    // ensure that no symbol is repeated or missing
    const symbolsSet = new Set<number>();
    for (const value of this.symbols) {
      if (symbolsSet.has(value)) {
        return false;
      }
      symbolsSet.add(value);
    }
    for (let i = 0; i < 256; i++) {
      if (!symbolsSet.has(i)) {
        return false;
      }
    }
    return true;
  }

  public static fromSeed(
    seed: number | bigint,
    offset: number,
    type: SymbolMapType
  ): SymbolMapping {
    const xorShift = new Rand(seed.toString(10));
    const availableSymbols = new Set<number>();
    for (let i = 0; i < 256; i++) {
      availableSymbols.add(i);
    }
    const symbols = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      const nextInt = randChoice(Array.from(availableSymbols), xorShift);
      availableSymbols.delete(nextInt);
      symbols[i] = nextInt;
    }
    return new SymbolMapping(symbols, offset, type);
  }

  public static fromRandomSeed(
    offset: number,
    type: SymbolMapType
  ): SymbolMapping {
    return SymbolMapping.fromSeed(randomBigint(), offset, type);
  }

  public reverse(offset?: number): SymbolMapping {
    const symbols = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      symbols[this.symbols[i]] = i;
    }
    return new SymbolMapping(symbols, offset ?? this._offset, this.classType);
  }

  public symbolLookup(symbol: number): number {
    for (let i = 0; i < 256; i++) {
      if (this.symbols[i] == symbol) {
        return i;
      }
    }
    throw new Error("Symbol not found");
  }

  public toString(type: SymbolMapType): string {
    const datum = SymbolMapping.symbolMapTypeDatumByType(type);
    let result = datum.key + "S=";
    for (const symbol of this.symbols) {
      result += symbol.toString(16).padStart(2, "0");
    }
    result += "\n" + datum.key + "C=" + this.checksum;
    if (this.classType == SymbolMapType.Rotor) {
      result +=
        "\n" + datum.key + "O=" + this._offset.toString(16).padStart(2, "0");
    }
    return result;
  }

  public static fromString(str: string, type: SymbolMapType): SymbolMapping {
    const datum = SymbolMapping.symbolMapTypeDatumByType(type);
    const lines = str.split("\n");
    const symbols: Uint8Array = new Uint8Array(256);
    let offset = 0;
    let checksum = "";
    for (const line of lines) {
      if (line.length == 0) {
        continue;
      }
      const parts = line.split("=");
      if (parts.length !== 2) {
        throw new Error("Invalid line: " + line);
      }
      const key = parts[0];
      const value = parts[1];
      if (key === datum.key + "S") {
        if (value.length !== 512) {
          throw new Error("Invalid symbol string length");
        }
        for (let i = 0, symbolIndex = 0; i < value.length; i += 2) {
          symbols[symbolIndex++] = parseInt(value.substring(i, i + 2), 16);
        }
      } else if (key === datum.key + "O") {
        offset = parseInt(value, 16);
        if (isNaN(offset)) {
          throw new Error("Invalid offset: " + value);
        }
      } else if (key === datum.key + "C") {
        checksum = value;
      }
    }
    const symbolMap = new SymbolMapping(symbols, offset, type);
    if (checksum.length > 0 && symbolMap.checksum !== checksum) {
      throw new Error("Invalid checksum");
    }
    return symbolMap;
  }

  public static symbolMapTypeDatumByType(
    type: SymbolMapType
  ): ISymbolMapTypeDatum {
    for (let i = 0; i < SymbolMapTypeData.length; i++) {
      if (SymbolMapTypeData[i].type === type) {
        return SymbolMapTypeData[i];
      }
    }
    throw new Error("Invalid symbol map type: " + type);
  }

  public static symbolTypeFromString(type: string): SymbolMapType {
    if (type.indexOf("S=") != 1) {
      throw new Error("Invalid symbol map type string: " + type);
    }
    const index = SymbolMapTypeCharacters.indexOf(type[0]);
    if (index < 0) {
      throw new Error("Invalid symbol map type: " + type);
    }
    return SymbolMapTypes[index];
  }

  public static extractSymbols(str: string): string[] {
    let typeData = "";
    const types: string[] = [];
    const lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length == 0) {
        continue;
      }
      // make sure the line starts wtih *S= and the * is one of the valid types
      if (
        line.indexOf("S=") == 1 &&
        SymbolMapTypeCharacters.indexOf(line[0]) != -1
      ) {
        if (typeData.length > 0) {
          // push the type
          types.push(typeData);
        }
        // start a new type
        typeData = line + "\n";
      } else {
        typeData += line + "\n";
      }
    }
    if (typeData.length > 0) {
      types.push(typeData);
    }
    return types;
  }
}
