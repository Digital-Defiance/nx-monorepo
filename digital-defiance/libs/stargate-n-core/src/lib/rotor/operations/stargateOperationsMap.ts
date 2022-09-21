import NoOperation from "./noOperation";
import StargateOperationType from "./stargateOperationType";
import StargateOperation from "./stargateOperation";

/**
 * @description A Stargate Operation Map is a map of Stargate Operations by their type to instances of their implementation.
 */
const startgateOperationsMap = new Map<StargateOperationType, StargateOperation>([
    [StargateOperationType.NoOperation, new NoOperation]
]);

export default startgateOperationsMap;