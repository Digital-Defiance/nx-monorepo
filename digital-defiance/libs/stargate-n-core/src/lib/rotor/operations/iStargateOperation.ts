import Quanta from "../../quanta/quanta";
import TransformedQuanta from "../../quanta/transformedQuanta";

export default interface IStargateOperation {
    operate(quanta: Quanta | TransformedQuanta): TransformedQuanta;
}
