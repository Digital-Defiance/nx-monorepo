import * as uuid from 'uuid';
import { ec as EC } from 'elliptic';
import {
  IReadOnlyBasicObjectDTO,
  ISigningKeyInfo,
  ISimpleKeyPairBuffer,
} from './interfaces';
import StaticHelpersKeyPair from './staticHelpers.keypair';
import BrightChainMemberType from './memberType';
import StaticHelpers from './staticHelpers';
import { KeyPairSyncResult } from 'crypto';
import GuidV4, { toFullHexFromBigInt, FullHexGuid } from './guid';
/**
 * A member of Brightchain.
 * @param id The unique identifier for this member.
 * @param name The name of this member.
 */
export default class BrightChainMember implements IReadOnlyBasicObjectDTO {
  /**
   * Signatures and verification are done using the signing key pair.
   * The key pair may or may not be loaded.
   */
  private _signingKeyPair: null | EC.KeyPair;

  /**
   * Data to/from/for the member is encrypted using the data key pair.
   * The key pair may or may not be loaded.
   * Note that the data key is not itself associated with the signing key,
   * but is stored encrypted using the mnemonic phrase from the signing key
   */
  private _dataKeyPair: null | ISimpleKeyPairBuffer;

  public get hasDataKeyPair(): boolean {
    return this._dataKeyPair !== null;
  }

  public get hasSigningKeyPair(): boolean {
    return this._signingKeyPair !== null;
  }

  public get hasDataPrivateKey(): boolean {
    return (
      this._dataKeyPair !== null && this._dataKeyPair.privateKey.length > 0
    );
  }

  public get hasSigningPrivateKey(): boolean {
    try {
      return (
        this._signingKeyPair !== null &&
        this._signingKeyPair.getPrivate('hex').length > 0
      );
    } catch (e) {
      return false;
    }
  }

  public get signingKeyPair(): EC.KeyPair {
    if (this._signingKeyPair === null) {
      throw new Error('Signing key pair not set');
    }
    return this._signingKeyPair;
  }

  public get signingPublicKey(): Buffer {
    if (this._signingKeyPair === null) {
      throw new Error('Signing key pair not set');
    }
    return Buffer.from(this._signingKeyPair.getPublic('hex'), 'hex');
  }

  public get signingPrivateKey(): Buffer {
    if (!this._signingKeyPair) {
      throw new Error('No data key pair');
    }
    const privateKey = this._signingKeyPair.getPrivate('hex');
    if (!privateKey) {
      throw new Error('No private key');
    }
    return Buffer.from(privateKey, 'hex');
  }

  public get dataKeyPair(): ISimpleKeyPairBuffer {
    if (this._dataKeyPair === null) {
      throw new Error('Data key pair not set');
    }
    return this._dataKeyPair;
  }

  public get dataPublicKey(): Buffer {
    if (this._dataKeyPair === null) {
      throw new Error('Data key pair not set');
    }
    return this._dataKeyPair.publicKey;
  }

  public get dataPrivateKey(): Buffer {
    if (
      !this._dataKeyPair ||
      !this._dataKeyPair.privateKey ||
      this._dataKeyPair.privateKey.length == 0
    ) {
      throw new Error('No data key pair');
    }
    return this._dataKeyPair.privateKey;
  }

  public get dataEncryptedPrivateKey(): Buffer {
    if (!this._dataKeyPair) {
      throw new Error('No data key pair');
    }
    return this._dataKeyPair.privateKey;
  }

  public readonly id: FullHexGuid;
  public readonly memberType: BrightChainMemberType;
  public readonly name: string;
  public readonly contactEmail: string;
  public readonly creatorId: FullHexGuid;
  public readonly dateCreated: Date;
  public readonly dateUpdated: Date;
  constructor(
    memberType: BrightChainMemberType,
    name: string,
    contactEmail: string,
    signingKeyPair?: ISimpleKeyPairBuffer,
    dataKeyPair?: ISimpleKeyPairBuffer,
    id?: string,
    dateCreated?: Date,
    dateUpdated?: Date,
    creatorId?: FullHexGuid,
  ) {
    this.memberType = memberType;
    if (id !== undefined) {
      let newGuid: GuidV4;
      try {
        newGuid = new GuidV4(id);
      } catch (e) {
        throw new Error('Invalid member ID');
      }
      this.id = newGuid.asFullHexGuid;
    } else {
      this.id = GuidV4.new().asFullHexGuid;
    }
    this.name = name;
    if (!this.name || this.name.length == 0) {
      throw new Error('Member name missing');
    }
    if (this.name.trim() != this.name) {
      throw new Error('Member name has leading or trailing spaces');
    }
    this.contactEmail = contactEmail;
    if (!this.contactEmail || this.contactEmail.length == 0) {
      throw new Error('Member email missing');
    }
    if (this.contactEmail.trim() != this.contactEmail) {
      throw new Error('Member email has leading or trailing spaces');
    }
    if (!StaticHelpers.validateEmail(this.contactEmail)) {
      throw new Error('Member email is invalid');
    }

    this._signingKeyPair = null;
    if (signingKeyPair) {
      this.loadSigningKeyPair(signingKeyPair);
    }
    this._dataKeyPair = null;
    if (dataKeyPair) {
      this.loadDataKeyPair(dataKeyPair);
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
    this.creatorId = creatorId ?? this.id;
  }

  /**
   * Load a signing key pair for this member.
   * @param keyPair The key pair to load.
   */
  public loadSigningKeyPair(keyPair: ISimpleKeyPairBuffer) {
    const curve = new EC(StaticHelpersKeyPair.DefaultECMode);
    let valid = false;
    let kp: null | EC.KeyPair = null;
    try {
      kp = curve.keyFromPrivate(keyPair.privateKey.toString('hex'), 'hex');
      valid = kp.validate().result;
    } catch (e) {
      valid = false;
    }
    if (
      !valid ||
      kp === null ||
      !StaticHelpersKeyPair.challengeSigningKeyPair(kp)
    ) {
      throw new Error('Invalid key pair');
    }
    this._signingKeyPair = kp;
  }

  /**
   * Load a signing key pair for this member.
   * @param keyPair The key pair to load.
   */
  public loadDataKeyPair(keyPair: ISimpleKeyPairBuffer) {
    // challenge the data key pair
    const password =
      StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMember(this);
    let valid = false;
    try {
      valid =
        valid || StaticHelpersKeyPair.challengeDataKeyPair(keyPair, password);
    } catch (e) {
      // empty
    }
    if (!valid) {
      throw new Error(
        'Unable to challenge data key pair with mneomonic from signing key pair'
      );
    }
    this._dataKeyPair = keyPair;
  }

  public unloadDataKeyPair(): void {
    this._dataKeyPair = null;
  }

  public unloadSigningKeyPair(): void {
    this._signingKeyPair = null;
  }

  /**
   * Sign the data using the loaded key pair.
   * @param data
   * @param options
   * @returns
   */
  public sign(data: Buffer, options?: EC.SignOptions): EC.Signature {
    if (!this._signingKeyPair) {
      throw new Error('No key pair');
    }
    return StaticHelpersKeyPair.signWithSigningKey(
      this._signingKeyPair,
      data,
      options
    );
  }

  /**
   * Verify the data signature using the loaded key pair.
   * @param signature
   * @param data
   * @returns
   */
  public verify(signature: EC.Signature, data: Buffer): boolean {
    if (!this._signingKeyPair) {
      throw new Error('No key pair');
    }
    return StaticHelpersKeyPair.verifyWithSigningKey(
      this._signingKeyPair,
      signature,
      data
    );
  }

  public rekeySigningKeyPair(): ISigningKeyInfo {
    if (!StaticHelpersKeyPair.challengeSigningKeyPair(this.signingKeyPair)) {
      throw new Error('Invalid current signing key pair');
    }
    const newSigningKeyPair = StaticHelpersKeyPair.generateSigningKeyPair();

    // get data private key with current passphrase, convert to new passphrase
    const currentSigningKeyPassphrase =
      StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMemberId(
        this.id,
        this.signingKeyPair
      );
    const newSigningKeyPassphrase =
      StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMemberId(
        this.id,
        newSigningKeyPair.keyPair
      );

    // using the current signing key prhase, decrypt the data key pair
    const decryptedDataPrivateKey = StaticHelpersKeyPair.decryptDataPrivateKey(
      this.signingPrivateKey,
      currentSigningKeyPassphrase
    ).toString('utf8');
    // make a key pair sync result encryptPrivateKeyData can use
    const newKpSyncResult: KeyPairSyncResult<string, string> = {
      publicKey: this.dataPublicKey.toString('utf8'),
      privateKey: decryptedDataPrivateKey,
    };
    const updatedDataKeyPairWithReCryptedPrivate =
      StaticHelpersKeyPair.encryptPrivateKeyData(
        newKpSyncResult,
        newSigningKeyPassphrase
      );
    if (
      !StaticHelpersKeyPair.challengeDataKeyPair(
        updatedDataKeyPairWithReCryptedPrivate,
        newSigningKeyPassphrase
      )
    ) {
      throw new Error('Unable to rekey signing key pair successfully');
    }
    this._dataKeyPair = updatedDataKeyPairWithReCryptedPrivate;
    this._signingKeyPair = newSigningKeyPair.keyPair;
    return newSigningKeyPair;
  }

  // public publicEncrypt(data: Buffer): Buffer {
  //   if (!this._signingKeyPair) {
  //     throw new Error('No key pair');
  //   }
  //   return publicEncrypt(this._signingKeyPair.getPublic(), data);
  // }

  /**
   * Create a new member and generate its keys
   * @param type
   * @param name
   * @param contactEmail
   * @returns
   */
  public static newMember(
    memberType: BrightChainMemberType,
    name: string,
    contactEmail: string
  ): BrightChainMember {
    const newId = uuid.v4();
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    return new BrightChainMember(
      memberType,
      name,
      contactEmail,
      StaticHelpersKeyPair.getSigningKeyInfoFromKeyPair(keyPair.signing),
      keyPair.data,
      new GuidV4(newId).asFullHexGuid
    );
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      type: this.memberType,
      name: this.name,
      contactEmail: this.contactEmail,
      signingKeyPair: this.signingKeyPair,
      dataKeyPair: this.dataKeyPair,
      createdBy: this.creatorId as string,
      dateCreated: this.dateCreated,
      dateUpdated: this.dateUpdated,
    });
  }
  fromJSON(json: string): BrightChainMember {
    const parsedMember = JSON.parse(json) as {
      id: string;
      type: BrightChainMemberType;
      name: string;
      contactEmail: string;
      signingKeyPair: ISigningKeyInfo;
      dataKeyPair: ISimpleKeyPairBuffer;
      createdBy: string;
      dateCreated: Date;
      dateUpdated: Date;
    };
    console.log('parsedMember', parsedMember);
    
    return new BrightChainMember(
      parsedMember.type,
      parsedMember.name,
      parsedMember.contactEmail,
      parsedMember.signingKeyPair,
      parsedMember.dataKeyPair,
      parsedMember.id,
      parsedMember.dateCreated,
      parsedMember.dateUpdated,
      parsedMember.createdBy as FullHexGuid,
    );
  }
}
