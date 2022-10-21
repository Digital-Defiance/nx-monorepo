import * as uuid from 'uuid';
import { ec as EC } from 'elliptic';
import QuorumMemberData from './quorumMemberData';
import { ISimpleKeyPairBuffer } from './interfaces';
import StaticHelpersKeyPair from 'libs/brightchain/src/lib/staticHelpers.keypair';
import BrightChainMemberType from 'libs/brightchain/src/lib/memberType';

/**
 * A member of a Brightchain Quorum.
 * @param id The unique identifier for this member.
 * @param name The name of this member.
 */
export default class QuorumMember extends QuorumMemberData {
  constructor(
    memberType: BrightChainMemberType,
    name: string,
    contactEmail: string,
    signingKeyPair?: ISimpleKeyPairBuffer,
    dataKeyPair?: ISimpleKeyPairBuffer,
    id?: string
  ) {
    super(
      memberType,
      name,
      contactEmail,
      signingKeyPair,
      dataKeyPair,
      undefined, // dateCreated
      undefined, // dateUpdates
      id
    );
  }

  /**
   * Create a new quorum member and generate its keys
   * @param type
   * @param name
   * @param contactEmail
   * @returns
   */
  public static override newMember(
    type: BrightChainMemberType,
    name: string,
    contactEmail: string
  ): QuorumMember {
    const newId = uuid.v4();
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    return new QuorumMember(
      type,
      name,
      contactEmail,
      StaticHelpersKeyPair.rebuildSigningKeyPairResultFromKeyPair(
        keyPair.signing
      ),
      keyPair.data,
      newId
    );
  }
}
