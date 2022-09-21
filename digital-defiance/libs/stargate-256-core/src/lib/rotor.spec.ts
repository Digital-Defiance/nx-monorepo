import Rotor from "./rotor";
import { partByPartType } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";
import { randomBigint } from "./util";

describe("rotor", () => {
  it("should create a rotorA", () => {
    const rotor = Rotor.rotorA();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorA);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    expect(rotor.checksum).toEqual(rotorDatum.checksumString);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a rotorB", () => {
    const rotor = Rotor.rotorB();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorB);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    expect(rotor.checksum).toEqual(rotorDatum.checksumString);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a rotorC", () => {
    const rotor = Rotor.rotorC();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorC);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    expect(rotor.checksum).toEqual(rotorDatum.checksumString);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a rotorD", () => {
    const rotor = Rotor.rotorD();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorD);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    expect(rotor.checksum).toEqual(rotorDatum.checksumString);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a rotorE", () => {
    const rotor = Rotor.rotorE();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorE);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    expect(rotor.checksum).toEqual(rotorDatum.checksumString);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a random rotor", () => {
    const rotor = Rotor.fromRandomSeed(0);
    // TODO: inspect reflector values for sanity
    expect(rotor).toBeDefined();
  });
  it("should create rotors repeatably from a non default seed", () => {
    // pick a random seed
    const randomSeed = randomBigint();
    const rotor1 = Rotor.fromSeed(randomSeed, 0);
    const rotor2 = Rotor.fromSeed(randomSeed, 0);
    // pick another seed
    const randomSeed2 = randomBigint();
    expect(randomSeed).not.toEqual(randomSeed2);
    const rotor3 = Rotor.fromSeed(randomSeed2, 0);
    // no two rotors should have the same id, regardless of seed/symbols/checksum
    // but reflector1 and reflector2 should have the same checksum and symbols
    expect(rotor1.symbols).toEqual(rotor2.symbols);
    expect(rotor1.symbols).not.toEqual(rotor3.symbols);
    expect(rotor1.checksum).toEqual(rotor2.checksum);
    expect(rotor1.checksum).not.toEqual(rotor3.checksum);
  });
  it("should emit a string representation of the rotor in human readable form when toString() is called", () => {
    const rotor = Rotor.rotorA();
    const rotorDatum = partByPartType(SuppliedPartType.RotorA);
    expect(rotor.toString()).toEqual(rotorDatum.partString);
  });
  it("should create a rotor from a string representation", () => {
    const rotor = Rotor.rotorA();
    expect(rotor).toBeDefined();
    const rotorDatum = partByPartType(SuppliedPartType.RotorA);
    expect(rotor.symbols).toEqual(rotorDatum.symbols);
    const rotorString = rotor.toString();
    const rotor2 = Rotor.fromString(rotorString);
    expect(rotor2).toBeDefined();
    expect(rotor2.symbols).toEqual(rotorDatum.symbols);
    expect(rotor2.checksum).toEqual(rotor.checksum);
  });
  // it("copied from C++ and modified to work with JS and then dump the rotor sets in hex", () => {
  //     console.log(rotorSetToString(makeRotorSet()));
  // });
});
