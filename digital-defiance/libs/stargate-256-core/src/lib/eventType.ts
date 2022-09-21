export enum EventType {
    StargateCreated = 1,
    ReflectorMoved = 2,
    RotorMoved = 4,
    SymbolInput = 8,
    SymbolRotationTrigger = 16,
    SymbolOutput = 32,
}

export const EventTypes: Array<EventType> = [
    EventType.StargateCreated,
    EventType.RotorMoved,
    EventType.SymbolInput,
    EventType.SymbolRotationTrigger,
    EventType.SymbolOutput,
];

export default EventType;