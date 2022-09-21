import EventType from "./eventType";
import { StargateEvent } from "./stargateEvent";

export default class EventQueue {
  public readonly type: EventType;
  private readonly _listeners: ((event: StargateEvent) => void)[] = [];
  private debug: boolean;
  constructor(type: EventType, debug?: boolean) {
    this.type = type;
    this.debug = debug ?? false;
  }
  public addListener(listener: (event: StargateEvent) => void): void {
    if (this.debug) {
      console.log(`Adding listener for event ${this.type}`);
    }
    this._listeners.push(listener);
  }
  public fire(event: StargateEvent, ...payload: never[]): void {
    if (this.debug) {
      console.log(`Firing event ${event.type}`);
    }
    this._listeners.forEach((listener) => listener(event));
  }
  public removeListener(listener: (event: StargateEvent) => void): void {
    if (this.debug) {
      console.log(`Removing listener for event ${this.type}`);
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  public hasListener(listener: (event: StargateEvent) => void): boolean {
    return this._listeners.indexOf(listener) !== -1;
  }
}
