import { Shares } from 'secrets.js-34r7h';
import * as uuid from 'uuid';
import { EncryptedShares, IMemberShareCount } from './interfaces';
import QuorumMember from './member';
import QuorumDataRecord from './quorumDataRecord';
import SimpleStore from 'libs/brightchain/src/lib/stores/simpleStore';
import BufferStore from 'libs/brightchain/src/lib/stores/bufferStore';
import StaticHelpersSealing from './staticHelpers.sealing';

export default class BrightChainQuorum {
  /**
   * Member ID, uuid
   */
  public readonly id: string;

  /**
   * The node owner is the system key pair that is used to sign and verify with Quorum members
   */
  private readonly nodeAgent: QuorumMember;

  /**
   * The name of the quorum
   */
  public readonly name: string;

  /**
   * Quorum members collection, keys may or may not be loaded for a given member
   */
  private readonly _members: SimpleStore<string, QuorumMember>;

  /**
   * Collection of signing public keys for each member of the quorum.
   * This may include members not on this node.
   * Never erase, only add/update.
   */
  private readonly _memberSigningPublicKeysByMemberId: BufferStore<string>;

  /**
   * Collection of data keys for each member of the quorum.
   * This may include members not on this node.
   * Never erase, only add/update.
   */
  private readonly _memberDataPublicKeysByMemberId: BufferStore<string>;

  /**
   * Collection of key shares that this quorum node has taken responsbility for
   * -- these should be encrypted with each member's private key
   */
  private readonly _documentKeySharesById: SimpleStore<string, EncryptedShares>;

  /**
   * Collection of encrypted documents that this quorum node has taken responsibility for
   */
  private readonly _documentsById: SimpleStore<string, QuorumDataRecord>;

  constructor(nodeAgent: QuorumMember, name: string, id?: string) {
    this.id = id ?? uuid.v4();
    if (!uuid.validate(this.id)) {
      throw new Error('Invalid quorum ID');
    }
    this._members = new SimpleStore<string, QuorumMember>();
    this._memberSigningPublicKeysByMemberId = new BufferStore<string>();
    this._memberDataPublicKeysByMemberId = new BufferStore<string>();
    this._documentKeySharesById = new SimpleStore<string, EncryptedShares>();
    this._documentsById = new SimpleStore<string, QuorumDataRecord>();

    this.nodeAgent = nodeAgent;
    this.name = name;

    this.storeMember(nodeAgent);
    // TODO create and validate a signature based on the node ID and the agent's public key
  }

  /**
   * Physically add a member to the members collection and key stores
   * @param member
   */
  protected storeMember(member: QuorumMember) {
    this._members.set(member.id, member);
    this._memberSigningPublicKeysByMemberId.set(
      member.id,
      member.signingPublicKey
    );
    this._memberDataPublicKeysByMemberId.set(member.id, member.dataPublicKey);
    this._members.save();
    this._memberSigningPublicKeysByMemberId.save();
    this._memberDataPublicKeysByMemberId.save();
  }

  /**
   * Returns whether this node has taken responsibility for a given document.
   * Some nodes may have different responsibilities for different documents, depending on the members using the node.
   * @param id
   * @returns
   */
  public hasDocument(id: string): boolean {
    return this._documentsById.has(id) && this._documentKeySharesById.has(id);
  }

  /**
   * Encrypts and adds a document to the quorum.
   * @param document
   * @param amongstMembers
   * @param membersRequired
   * @returns
   */
  public addDocument<T>(
    agent: QuorumMember,
    document: T,
    amongstMembers: QuorumMember[],
    shareCountByMemberId?: Array<IMemberShareCount>
  ): QuorumDataRecord {
    const newDoc = StaticHelpersSealing.quorumSeal<T>(
      agent,
      document,
      amongstMembers.map((m) => m.id),
      shareCountByMemberId
    );
    if (amongstMembers.length !== (newDoc.keyShares as Array<string>).length)
      throw new Error('Key share count does not match member list size');

    const encryptedShares: Map<string, EncryptedShares> =
      StaticHelpersSealing.encryptSharesForMembers(
        newDoc.keyShares,
        amongstMembers,
        shareCountByMemberId
      );
    const combinedShares: EncryptedShares = new Array<string>();
    encryptedShares.forEach((shares) => {
      shares.forEach((share) => combinedShares.push(share));
    });

    this._documentsById.set(newDoc.record.id, newDoc.record);
    this._documentKeySharesById.set(newDoc.record.id, combinedShares);
    this._documentsById.save();
    this._documentKeySharesById.save();
    return newDoc.record;
  }

  /**
   * Ratrieves a document from the quorum using decrypted shares
   * @param id
   * @param shares
   * @returns
   */
  public getDocument<T>(id: string, shares: Shares): T {
    const doc = this._documentsById.get(id);
    if (!doc) {
      throw new Error('Document not found');
    }

    const restoredDoc = StaticHelpersSealing.quorumUnlock<T>(
      shares,
      doc.encryptedData
    );
    if (!restoredDoc) {
      throw new Error('Unable to restore document');
    }
    return restoredDoc;
  }

  /**
   * Returns whether the given set of members is sufficient to decrypt the document
   * @param id
   * @param members
   */
  public canUnlock(id: string, members: QuorumMember[]) {
    const doc = this._documentsById.get(id);
    if (!doc) {
      throw new Error('Document not found');
    }
    // check whether the supplied list of members are included in the document share distributions
    // as well as whether the number of members is sufficient to unlock the document
    throw new Error('Not implemented');
  }
}
