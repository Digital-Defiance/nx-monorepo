import Quanta from "../../quanta/quanta";
import TransformedQuanta from "../../quanta/transformedQuanta";
import IStargateOperation from "./iStargateOperation";
import StargateOperation from "./stargateOperation";

/**
 * @description A No Operation is an operation that does nothing by definition.
 * It is a single tick operation.
 */
export default class NoOperation extends StargateOperation implements IStargateOperation {
    operate(quanta: Quanta | TransformedQuanta): TransformedQuanta {
        return new TransformedQuanta(quanta, quanta.photons);
    }
}