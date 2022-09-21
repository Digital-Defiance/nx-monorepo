import Quanta from "./quanta";
import { Photons } from "quantum-tensors";

export interface TransformedQuantaInterface {
    readonly originalId: string;
    readonly transformationDate: Date;
}

/** 
 * @description A Transformed Quanta is just a quanta that has undergone an operation and maintains a reference to the previous state
 * */
export default class TransformedQuanta extends Quanta implements TransformedQuantaInterface
{
    public readonly originalId: string;
    public readonly transformationDate: Date;
    public constructor(
        originalQuanta: Quanta,
        photons: Photons,
        sequence: bigint | null = null,
        transformationDate: Date | null = null
    ) {
        const date = transformationDate === null 
            ? new Date() 
            : transformationDate;

        super(
            originalQuanta.associatedObject,
            sequence !== null 
              ? sequence 
              : originalQuanta.sequence + BigInt(1),
            photons
        );

        this.originalId = originalQuanta.id;
        this.transformationDate = date;
    }
}