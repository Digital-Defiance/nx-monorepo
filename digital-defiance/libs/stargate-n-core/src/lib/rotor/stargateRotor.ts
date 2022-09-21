import StargateMachine from "../stargateMachine";
import RotorConfiguration from "./rotorConfiguration";
import StargateOperationType from "./operations/stargateOperationType";
import StargateOperation from "./operations/stargateOperation";
import { v4 as uuidv4 } from "uuid";

/**
 * @description A rotor is a component of the stargate machine that performs one or more operations on the input quanta.
 * There may be multiple rotors in a stargate machine.
 */
export default class StargateRotor {
    public readonly id: string;
    public readonly stargate: StargateMachine;
    public readonly configuration: RotorConfiguration;
    public readonly operations: Array<StargateOperationType>;
    public readonly chevronList: Array<StargateOperation>;
    /**
     * list of chevrons in order, starting at 0 degrees.
     * total radians per chevron is 2 * Math.PI / chevronList.length
     */
    public readonly engagedChevrons: Array<StargateOperation>;
    public readonly radiansPerChevron: number;
    public constructor(stargate: StargateMachine, configuration: RotorConfiguration) {
        this.id = uuidv4();
        this.stargate = stargate;
        this.configuration = configuration;
        this.operations = [
            StargateOperationType.NoOperation,
        ]; // TODO: get from configuration
        this.chevronList = [
        ]; // TODO: get from configuration
        this.radiansPerChevron = 2 * Math.PI / this.chevronList.length;
        this.engagedChevrons = [];
    }

    private isStargateOpen(): boolean {
        return this.stargate.isStargateOpen();
    }
    public canReceive(): boolean {
        return this.isStargateOpen();
    }
    public canSend(): boolean {
        return this.isStargateOpen();
    }
    public receiveQuanta(data: Buffer): Buffer {
        if (!this.canReceive()) {
            throw new Error(`Stargate not open`);
        }
        console.log(data);
        throw new Error(`Not implemented`);
    }
}