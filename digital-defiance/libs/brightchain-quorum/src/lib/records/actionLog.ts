import { IBasicObject } from "libs/brightchain/src/lib/interfaces";
import QuorumDataRecordActionEventType from "./actionEvent";
import QuorumDataRecordActionType from "./actionType";

export default interface QuorumDataRecordActionLog extends IBasicObject {
    readonly eventId: string;
    readonly eventType: QuorumDataRecordActionEventType;
    readonly actionTaken: QuorumDataRecordActionType;
    readonly escrowed: boolean;
    readonly dateCreated: Date;
}