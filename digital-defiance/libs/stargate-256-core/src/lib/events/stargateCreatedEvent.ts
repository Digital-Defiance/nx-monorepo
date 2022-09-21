import EventType from "../eventType";
import { EventInterface } from "../interfaces";
import Stargate from "../stargate";
import { StargateEvent } from "../stargateEvent";

export class StargateCreatedEvent
  extends StargateEvent
  implements EventInterface
{
  public readonly type: EventType = EventType.StargateCreated;
  constructor(stargate: Stargate) {
    super(stargate, EventType.StargateCreated, {});
  }
}
