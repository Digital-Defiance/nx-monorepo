import IStargateOperation from "./iStargateOperation";
import Quanta from "../../quanta/quanta";
import TransformedQuanta from "../../quanta/transformedQuanta";

/**
 * @description A Stargate Operation is an operation that can be applied to quanta or transformed quanta.
 * A transformed quanta is produced.
 */
export default abstract class StargateOperation implements IStargateOperation {
    public abstract operate(quanta: Quanta | TransformedQuanta): TransformedQuanta;
}
