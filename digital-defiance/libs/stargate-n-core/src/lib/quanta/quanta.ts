import QuantizedObject from "../quantizedObject";
import { Photons } from "quantum-tensors";
import { v4 as uuidv4 } from "uuid";

export interface QuantaInterface {
    readonly id: string;
    readonly associatedObject: QuantizedObject;
    readonly sequence: bigint;
    readonly checksum: string;
    readonly creationDate: Date;
    readonly photons: Photons;
}

/**
 * @description A Quanta is the smallest unit of information that can be sent through the stargate.
 * It may contain several photons entangled.
 * It is associated with a quantum object.
 * It is identified by a unique id.
 * It is identified by a sequence number.
 * It is identified by a timestamp.
 */
export default class Quanta implements QuantaInterface {
    public readonly id: string;
    public readonly associatedObject: QuantizedObject;
    public readonly sequence: bigint;
    public readonly checksum: string;
    public readonly creationDate: Date;
    public readonly photons: Photons;
    public constructor(associatedObject: QuantizedObject, sequence: bigint, photons: Photons) {
        const date = new Date();
        this.id = uuidv4();
        this.associatedObject = associatedObject;
        this.sequence = sequence;
        this.creationDate = date;
        this.photons = photons;
        // TODO: implement checksum
        this.checksum = "TODO";
    }
}