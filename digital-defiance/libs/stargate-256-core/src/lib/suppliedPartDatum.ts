import { ISuppliedPartDatum } from "./interfaces";
import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import SymbolMapType, { symbolTypeToSymbolDatum } from "./symbolMapType";

export default class SuppliedPartDatum implements ISuppliedPartDatum {
  public readonly suppliedPartType: SuppliedPartType;
  public readonly suppliedPartGroup: SymbolMapType;
  public readonly name: string;
  public readonly checksumString: string;
  public readonly symbols: Uint8Array;
  public readonly symbolString: string;
  constructor(
    suppliedPartType: SuppliedPartType,
    suppliedPartGroup: SymbolMapType,
    name: string,
    symbols: Uint8Array,
    checksumString: string,
    symbolString: string
  ) {
    this.suppliedPartType = suppliedPartType;
    this.suppliedPartGroup = suppliedPartGroup;
    this.name = name;
    this.checksumString = checksumString;
    this.symbols = symbols;
    this.symbolString = symbolString;
  }
  public get partString(): string {
    const datum = symbolTypeToSymbolDatum(this.suppliedPartGroup);
    const partInfo = partByPartType(this.suppliedPartType);
    const symbolLine = datum.key + "S=" + partInfo.symbolString;
    const checksumLine = datum.key + "C=" + partInfo.checksumString;
    const offsetLine = datum.useOffset ? datum.key + "O=00" : "";
    return (
      symbolLine + "\n" + checksumLine + (offsetLine ? "\n" + offsetLine : "")
    );
  }
}
