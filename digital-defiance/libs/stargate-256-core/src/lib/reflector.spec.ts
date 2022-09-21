import Reflector from "./reflector";
import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import { randomBigint } from "./util";

describe("reflector", () => {
  it("should create a reflectorA", () => {
    const reflector = Reflector.reflectorA(0);
    expect(reflector).toBeDefined();
    expect(reflector.checksum).toBeDefined();
    expect(reflector.symbols).toBeDefined();
    expect(reflector.validateSymbols()).toBeTruthy();
    const partData = partByPartType(SuppliedPartType.ReflectorA);
    expect(reflector.symbols).toEqual(partData.symbols);
    expect(reflector.checksum).toEqual(partData.checksumString);
  });
  it("should create a random reflector", () => {
    const reflector = Reflector.fromRandomSeed(0);
    expect(reflector).toBeDefined();
    expect(reflector.checksum).toBeDefined();
    expect(reflector.symbols).toBeDefined();
    expect(reflector.validateSymbols()).toBeTruthy();
    // TODO: inspect reflector values for sanity
  });
  it("should create reflectors repeatably from a non default seed", () => {
    // pick a random seed
    const randomSeed = randomBigint();
    const defaultReflector = Reflector.straightThroughReflector(0);
    // create a reflector with the random seed
    const reflector1 = Reflector.fromSeed(randomSeed, 0);
    // create another reflector with the same seed
    const reflector2 = Reflector.fromSeed(randomSeed, 0);
    // no two reflectors should have the same id, regardless of seed/symbols/checksum
    // but reflector1 and reflector2 should have the same checksum and symbols
    expect(reflector1.symbols).toEqual(reflector2.symbols);
    expect(reflector1.symbols).not.toEqual(defaultReflector.symbols);
    expect(defaultReflector.checksum).not.toEqual(reflector1.checksum);
    expect(defaultReflector.checksum).not.toEqual(reflector2.checksum);
    expect(reflector1.checksum).toEqual(reflector2.checksum);
  });
  it("should emit a string representation of the reflector in human readable form when toString() is called", () => {
    const reflector = Reflector.reflectorA(0);
    const partData = partByPartType(SuppliedPartType.ReflectorA);
    expect(reflector.toString()).toEqual(partData.partString);
  });
  it("should create a reflector from a string representation", () => {
    const reflector = Reflector.reflectorA(0);
    const reflectorString = reflector.toString();
    const partData = partByPartType(SuppliedPartType.ReflectorA);
    expect(reflectorString).toEqual(partData.partString);
    const reflectorFromString = Reflector.fromString(reflectorString);
    expect(reflectorFromString.checksum).toEqual(reflector.checksum);
    expect(reflectorFromString.symbols).toEqual(reflector.symbols);
  });
});
