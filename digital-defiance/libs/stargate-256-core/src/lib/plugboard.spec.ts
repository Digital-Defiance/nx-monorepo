import Plugboard from "./plugboard";
import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import { randomBigint } from "./util";

describe("stargate256Core", () => {
  it("should create a plugboard with a straight through configuration", () => {
    const plugboard = Plugboard.defaultStraightThrough();
    expect(plugboard).toBeDefined();
    const expectedPairs = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      expectedPairs[i] = i;
    }
    expect(plugboard.symbols).toEqual(expectedPairs);
    expect(plugboard.checksum).toBeDefined();
    const partData = partByPartType(SuppliedPartType.PlugboardA);
    expect(plugboard.checksum).toEqual(partData.checksumString);
  });
  it("should create a plugboard from a random seed", () => {
    const defaultPlugboard = Plugboard.defaultStraightThrough();
    const randomSeed = randomBigint();
    const plugboard1 = Plugboard.fromSeed(randomSeed);
    const plugboard2 = Plugboard.fromSeed(randomSeed);
    const randomSeed2 = randomBigint();
    expect(randomSeed).not.toEqual(randomSeed2);
    const plugboard3 = Plugboard.fromSeed(randomSeed2);
    expect(plugboard1).toBeDefined();
    expect(plugboard2).toBeDefined();
    expect(plugboard1.symbols).not.toEqual(defaultPlugboard.symbols);
    expect(plugboard1.checksum).toBeDefined();
    expect(plugboard1.checksum).not.toEqual(defaultPlugboard.checksum);
    expect(plugboard2.checksum).toBeDefined();
    expect(plugboard1.checksum).toEqual(plugboard2.checksum);
    expect(plugboard2.checksum).not.toEqual(defaultPlugboard.checksum);
    expect(plugboard3.checksum).toBeDefined();
    expect(plugboard3.checksum).not.toEqual(defaultPlugboard.checksum);
    expect(plugboard3.checksum).not.toEqual(plugboard1.checksum);
    expect(plugboard3.checksum).not.toEqual(plugboard2.checksum);
  });
  it("should emit a string representation of the plugboard in human readable form when toString() is called", () => {
    const plugboard = Plugboard.defaultStraightThrough();
    const partData = partByPartType(SuppliedPartType.PlugboardA);
    expect(plugboard.toString()).toEqual(partData.partString);
  });
  it("should create a plugboard from a string representation", () => {
    const plugboard = Plugboard.defaultStraightThrough();
    const stringRepresentation = plugboard.toString();
    const newPlugboard = Plugboard.fromString(stringRepresentation);
    expect(newPlugboard.checksum).toEqual(plugboard.checksum);
    expect(newPlugboard.symbols).toEqual(plugboard.symbols);
  });
});
