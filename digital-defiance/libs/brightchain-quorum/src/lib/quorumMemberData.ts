import * as uuid from 'uuid';
import StaticHelpers from 'libs/brightchain/src/lib/staticHelpers';
import BrightChainMember from 'libs/brightchain/src/lib/brightChainMember';
import BrightChainMemberType from 'libs/brightchain/src/lib/memberType';
import { ISimpleKeyPairBuffer } from 'libs/brightchain/src/lib/interfaces';

export default class QuorumMemberData extends BrightChainMember {
  constructor(
    memberType: BrightChainMemberType,
    name: string,
    contactEmail: string,
    signingKeyPair?: ISimpleKeyPairBuffer,
    dataKeyPair?: ISimpleKeyPairBuffer,
    dateCreated?: Date,
    dateUpdated?: Date,
    id?: string
  ) {
    super(memberType, name, contactEmail, signingKeyPair, dataKeyPair, id, dateCreated, dateUpdated);
  }
}
