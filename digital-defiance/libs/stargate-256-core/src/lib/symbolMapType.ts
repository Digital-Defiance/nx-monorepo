import { ISymbolMapTypeDatum } from "./interfaces";

export enum SymbolMapType {
  Unknown = -1,
  Plugboard = 1,
  Reflector = 2,
  Rotor = 4,
}

export const SymbolMapTypeData: ISymbolMapTypeDatum[] = [
  {
    type: SymbolMapType.Unknown,
    name: "Unknown",
    key: "-",
    useOffset: false,
  },
  {
    type: SymbolMapType.Plugboard,
    name: "Plugboard",
    key: "P",
    useOffset: false,
  },
  {
    type: SymbolMapType.Reflector,
    name: "Reflector",
    key: "X",
    useOffset: false,
  },
  {
    type: SymbolMapType.Rotor,
    name: "Rotor",
    key: "R",
    useOffset: true,
  },
];

export const SymbolMapTypes: SymbolMapType[] = SymbolMapTypeData.map(
  (x) => x.type
);
export const SymbolMapTypeNames: string[] = SymbolMapTypeData.map(
  (x) => x.name
);
export const SymbolMapTypeCharacters: string[] = SymbolMapTypeData.map(
  (x) => x.key
);
export const SymbolMapTypeOffsetEnabled: boolean[] = SymbolMapTypeData.map(
  (x) => x.useOffset
);

export function symbolTypeToSymbolDatum(
  type: SymbolMapType
): ISymbolMapTypeDatum {
  for (let i = 0; i < SymbolMapTypeData.length; i++) {
    if (SymbolMapTypeData[i].type === type) {
      return SymbolMapTypeData[i];
    }
  }
  throw new Error("Invalid symbol map type: " + type);
}

export default SymbolMapType;
