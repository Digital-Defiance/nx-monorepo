import Plugboard from "./plugboard";
import Reflector from "./reflector";
import Rotor from "./rotor";
import Stargate, {
  defaultStargateChecksum,
  defaultStargateStrings,
} from "./stargate";
import { StargateEvent } from "./stargateEvent";
import { suppliedPartChecksums } from "./suppliedParts";
import SymbolMapping from "./symbolMapping";
import SymbolMapType from "./symbolMapType";

describe("stargate", () => {
  it("should create a stargate", () => {
    const plugboard = Plugboard.defaultStraightThrough();
    const wheels = [
      Rotor.rotorA(),
      Rotor.rotorB(),
      Rotor.rotorC(),
      Rotor.rotorD(),
      Rotor.rotorE(),
      Reflector.reflectorA(),
    ];
    let eventFired = false;
    const stargate = new Stargate(plugboard, wheels, (event: StargateEvent) => {
      console.log(event);
      eventFired = true;
    });
    expect(stargate).toBeDefined();
    expect(eventFired).toBe(true);
    expect(stargate.toString()).toEqual(defaultStargateStrings.join("\n"));
    expect(stargate.checksum).toEqual(defaultStargateChecksum);
  });
  it("should create a stargate from a string", () => {
    const stargate = Stargate.fromString(defaultStargateStrings.join("\n"));
    expect(stargate).toBeDefined();
    expect(stargate.toString()).toEqual(defaultStargateStrings.join("\n"));
    expect(stargate.checksum).toEqual(defaultStargateChecksum);
  });
  return;
  it("is going to play with brute force", () => {
    let newSeed = -1n;
    //const map = new Map<number, Uint8Array>();
    let matches = 0;
    for (newSeed = 0n; newSeed < BigInt(Number.MAX_SAFE_INTEGER); newSeed++) {
      //console.log(newSeed);
      const mapping = SymbolMapping.fromSeed(newSeed, 0, SymbolMapType.Unknown);
      //map.set(newSeed, mapping.symbols);
      if (suppliedPartChecksums.includes(mapping.checksum)) {
        matches++;
        console.log("Found a match", newSeed, mapping.checksum);
      }
    }
    expect(matches).not.toEqual(0);
  });
});
