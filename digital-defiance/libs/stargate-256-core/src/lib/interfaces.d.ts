import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import SymbolMapping from "./symbolMapping";
import SymbolMapType, { symbolTypeToSymbolDatum } from "./symbolMapType";

export interface EventInterface {
  date: Date;
  type: EventType;
  payload: unknown[];
}

export interface IGalois {
  gmulInverse(a: number): number;
  sbox(a: number, key: number): number;
  // void sub_bytes(char streamLetter, unsigned char *key)

  gadd(a: number, b: number): number;
  gsub(a: number, b: number): number;
  gmulLookup(a: number, b: number): number;
  gdiv(a: number, b: number): number;
  generateGmulInverse(): void;
}

export interface ISymbolMapTypeDatum {
  type: SymbolMapType;
  name: string;
  key: string;
  useOffset: boolean;
}

export interface ISuppliedPartDatum {
  suppliedPartType: SuppliedPartType;
  suppliedPartGroup: SymbolMapType;
  name: string;
  checksumString: string;
  symbols: Uint8Array;
  symbolString: string;
  get partString(): string;
}
