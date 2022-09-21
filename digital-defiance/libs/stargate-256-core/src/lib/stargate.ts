import Plugboard from "./plugboard";
import EventType, { EventTypes } from "./eventType";
import EventQueue from "./eventQueue";
import { StargateEvent } from "./stargateEvent";
import SymbolMapping from "./symbolMapping";
import SymbolMapType from "./symbolMapType";
import { sha256 } from "hash.js";
import Rotor from "./rotor";
import Reflector from "./reflector";
import { partByPartType, partData } from "./suppliedParts";
import SuppliedPartType from "./suppliedPartType";

export const defaultStargateChecksum =
  "a54c698ef6e92b900b44fdf77f15f007f973d2440324cf9e67066871c4e5ebc8";
export const defaultStargateStrings: string[] = [
  // plugboard
  "PS=" + partData[0].symbolString,
  "PC=" + partData[0].checksumString,
  // rotorA
  "RS=" + partData[1].symbolString,
  "RC=" + partData[1].checksumString,
  "RO=00",
  // rotorB
  "RS=" + partData[2].symbolString,
  "RC=" + partData[2].checksumString,
  "RO=00",
  // rotorC
  "RS=" + partData[3].symbolString,
  "RC=" + partData[3].checksumString,
  "RO=00",
  // rotorD
  "RS=" + partData[4].symbolString,
  "RC=" + partData[4].checksumString,
  "RO=00",
  // rotorE
  "RS=" + partData[5].symbolString,
  "RC=" + partData[5].checksumString,
  "RO=00",
  // reflectorA
  "XS=" + partData[6].symbolString,
  "XC=" + partData[6].checksumString,
];

export default class Stargate {
  private readonly plugboard: Plugboard;
  private readonly wheels: Array<SymbolMapping>;
  private readonly rotorTriggerOffsets: Array<Uint8Array>;
  private readonly eventQueues: Map<EventType, EventQueue>;
  private debug: boolean;

  public file_do_cipher(infile: string, outfile: string, key: string): number {
    throw new Error("Method not implemented.");
  }

  private FileSize(sFileName: string): number {
    throw new Error("Method not implemented.");
  }
  private char_do_enigma(x: number): number {
    throw new Error("Method not implemented.");
  }
  private init_enigma(key: string): void {
    throw new Error("Method not implemented.");
  }
  private audit_rotors(currPosition: number): void {
    throw new Error("Method not implemented.");
  }
  private rotor_lookup(x: number, rotor: number): number {
    throw new Error("Method not implemented.");
  }

  constructor(
    plugboard: Plugboard,
    wheels: Array<SymbolMapping>,
    creationCallback?: (event: StargateEvent) => void,
    debug?: boolean
  ) {
    this.plugboard = plugboard;
    this.wheels = new Array<SymbolMapping>(wheels.length);
    for (let i = 0; i < wheels.length; i++) {
      this.wheels[i] = wheels[i];
    }

    this.rotorTriggerOffsets = new Array<Uint8Array>(wheels.length);
    this.eventQueues = new Map<EventType, EventQueue>();
    this.debug = debug ?? false;
    for (let i = 0; i < wheels.length; i++) {
      const rotor = wheels[i];
      const triggerArray = new Uint8Array();
      this.rotorTriggerOffsets[i] = triggerArray;
      // TODO: Add trigger symbols to trigger array
    }
    // loop through event types
    for (let i = 0; i < EventTypes.length; i++) {
      this.createQueue(EventTypes[i]);
    }
    // fire created event
    if (creationCallback !== null && creationCallback !== undefined) {
      // subscribe to created event
      const newEvent = new StargateEvent(this, EventType.StargateCreated);
      this.getQueue(newEvent.type).addListener(creationCallback);
      this.fire(newEvent);
    }
  }
  protected get mappings(): Array<SymbolMapping> {
    const mappings = new Array<SymbolMapping>(this.wheels.length + 1);
    // add plugboard to mappings
    mappings[0] = this.plugboard;
    for (let i = 0; i < this.wheels.length; i++) {
      const rotor = this.wheels[i];
      mappings[i + 1] = rotor;
    }

    // TODO: add reverse mappings
    return mappings;
  }
  public fire(event: StargateEvent): void {
    const queue = this.getQueue(event.type);
    queue.fire(event);
  }
  public getQueue(eventType: EventType): EventQueue {
    const queue = this.eventQueues.get(eventType);
    if (queue === null || queue === undefined) {
      return this.createQueue(eventType);
    }
    return queue;
  }
  private createQueue(eventType: EventType): EventQueue {
    if (this.eventQueues.has(eventType)) {
      throw new Error("Event queue already exists for event type " + eventType);
    }
    const newQueue = new EventQueue(eventType, this.debug);
    this.eventQueues.set(eventType, newQueue);
    return newQueue;
  }

  public symbolLookup(symbol: number, rotor: number): number {
    if (rotor < 0 || rotor >= this.wheels.length) {
      throw new Error("Invalid rotor index");
    }
    return this.wheels[rotor].symbolLookup(symbol);
  }

  public toString(): string {
    let result = this.plugboard.toString(SymbolMapType.Plugboard);
    for (let i = 0; i < this.wheels.length; i++) {
      const rotor = this.wheels[i];
      result += "\n" + rotor.toString(rotor.classType);
    }
    return result;
  }

  public static fromString(str: string): Stargate {
    const typeData = SymbolMapping.extractSymbols(str);
    let plugboard: Plugboard | null = null;
    const wheels: Array<SymbolMapping> = new Array<SymbolMapping>();
    for (let i = 0; i < typeData.length; i++) {
      const data = typeData[i];
      const dataType = SymbolMapping.symbolTypeFromString(data);
      switch (dataType) {
        case SymbolMapType.Plugboard:
          plugboard = Plugboard.fromString(data);
          break;
        case SymbolMapType.Rotor:
          wheels.push(Rotor.fromString(data));
          break;
        case SymbolMapType.Reflector:
          wheels.push(Reflector.fromString(data));
          break;
        default:
          throw new Error("Invalid symbol map type");
      }
    }
    if (plugboard === null) {
      throw new Error("No plugboard found");
    }
    return new Stargate(plugboard, wheels);
  }

  public get checksum(): string {
    // we are going to loop through the plugboard and wheels and create a string
    // calculate sha256 checksum from the bytes of each symbol mapping in the plugboard and wheels
    const hash = sha256();
    hash.update(this.plugboard.symbols);
    for (let i = 0; i < this.wheels.length; i++) {
      hash.update(this.wheels[i].symbols);
    }
    // checksum does not include the offsets
    return hash.digest("hex");
  }
}
