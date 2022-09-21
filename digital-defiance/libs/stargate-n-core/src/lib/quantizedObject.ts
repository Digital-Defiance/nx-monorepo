import Quanta from "./quanta/quanta";
import QuantizedObjectType from "./quantizedObjectType";
import { v4 as uuidv4 } from "uuid";

export interface QuantizedObjectInterface {
    readonly id: string;
    readonly quanta: Array<Quanta>;
    readonly checksum: string;
    readonly dataType: QuantizedObjectType;
}

/**
 * @description This is the base class for all objects that can be quantized.
 * It gives the object a unique ID, a checksum, and a type.
 */
export default class QuantizedObject implements QuantizedObjectInterface
{
    public readonly id: string;
    public readonly quanta: Array<Quanta>;
    public readonly checksum: string;
    public readonly dataType: QuantizedObjectType;
    public constructor(quanta: Array<Quanta>, checksum: string, type: QuantizedObjectType) {
        this.id = uuidv4();
        this.quanta = quanta;
        this.checksum = checksum;
        this.dataType = type;
    }
}