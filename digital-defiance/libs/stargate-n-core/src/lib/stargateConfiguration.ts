import RotorConfiguration from "./rotor/rotorConfiguration";

/**
 * @description This is the overall configuration for the stargate machine.
 * It contains the configuration for all rotors.
 * It should be contained in the redux store.
 */
export default class StargateConfiguration {
    public readonly rotorConfigurations: Array<RotorConfiguration>;
    public constructor(rotorConfigurations: Array<RotorConfiguration>) {
        this.rotorConfigurations = rotorConfigurations;
    }
}