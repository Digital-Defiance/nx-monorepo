import * as uuid from 'uuid';
import QuorumMember from './member';
import { ec as EC } from 'elliptic';
import StaticHelpers from './staticHelpers.checksum';
import StaticHelpersElliptic from './staticHelpers.elliptic';
import { IMemberShareCount } from './interfaces';

export default class QuorumDataRecord {
  public readonly id: string;
  public readonly encryptedData: Buffer;
  public static readonly checksumBits: number = 512;
  /**
   * sha-3 hash of the encrypted data
   */
  public readonly checksum: Buffer;
  public readonly signature: EC.Signature | null;
  public readonly memberIDs: string[];
  public readonly sharesRequired: number;
  public readonly dateCreated: Date;
  public readonly dateUpdated: Date;

  constructor(
    creator: QuorumMember,
    memberIDs: string[],
    sharesRequired: number,
    encryptedData: Buffer,
    shareCountsByMemberId?: Array<IMemberShareCount>,
    checksum?: Buffer,
    signature?: EC.Signature,
    id?: string,
    dateCreated?: Date,
    dateUpdated?: Date
  ) {
    this.id = id ?? uuid.v4();
    if (!uuid.validate(this.id)) {
      throw new Error('Invalid quorum data record ID');
    }

    if (memberIDs.length != 0 && memberIDs.length < 2) {
      throw new Error('Must share with at least 2 members');
    }
    this.memberIDs = memberIDs;
    if (sharesRequired != -1 && sharesRequired > memberIDs.length) {
      throw new Error('Shares required exceeds number of members');
    }
    if (sharesRequired != -1 && sharesRequired < 2) {
      throw new Error('Shares required must be at least 2');
    }
    // the share radio member ids must be a subset of the member ids
    if (shareCountsByMemberId) {
      for (let i = 0; i < shareCountsByMemberId.length; i++) {
        const shareRatio = shareCountsByMemberId[i];
        if (!memberIDs.includes(shareRatio.memberId)) {
          throw new Error('Share ratio member ID not found in member IDs');
        }
      }
    }

    this.sharesRequired = sharesRequired;
    this.encryptedData = encryptedData;
    const calculatedChecksum = StaticHelpers.calculateChecksum(encryptedData);
    if (checksum && checksum !== calculatedChecksum) {
      throw new Error('Invalid checksum');
    }
    this.checksum = calculatedChecksum;
    this.signature = signature ?? creator.sign(this.checksum);
    if (
      !StaticHelpersElliptic.verifySignature(
        this.encryptedData,
        this.signature,
        creator.signingPublicKey
      )
    ) {
      //throw new Error('Invalid signature');
    }

    // don't create a new date object with nearly identical values to the existing one
    let _now: null | Date = null;
    const now = function () {
      if (!_now) {
        _now = new Date();
      }
      return _now;
    };
    this.dateCreated = dateCreated ?? now();
    this.dateUpdated = dateUpdated ?? now();
  }
}
