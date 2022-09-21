import EventType from "./eventType";
import { EventInterface } from "./interfaces";
import Stargate from "./stargate";

export class StargateEvent implements EventInterface {
    public readonly date: Date;
    public readonly stargate: Stargate;
    public readonly type: EventType;
    public readonly payload: unknown[];

    constructor(stargate: Stargate, type: EventType, ...payload: unknown[]) {
        this.date = new Date();
        this.stargate = stargate;
        this.type = type;
        this.payload = payload;
    }
}