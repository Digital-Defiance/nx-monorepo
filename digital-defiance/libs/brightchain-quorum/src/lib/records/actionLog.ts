import { IBasicObjectDTO } from '@digital-defiance/brightchain';
import { QuorumDataRecordActionEventType } from './actionEvent';
import { QuorumDataRecordActionType } from './actionType';

export interface QuorumDataRecordActionLog extends IBasicObjectDTO {
  readonly eventId: string;
  readonly eventType: QuorumDataRecordActionEventType;
  readonly actionTaken: QuorumDataRecordActionType;
  readonly escrowed: boolean;
  readonly dateCreated: Date;
}
