import * as uuid from 'uuid';
import { ec as EC } from 'elliptic';
import {
  IMemberDTO,
  IReadOnlyBasicObjectDTO,
  ISigningKeyPrivateKeyInfo,
  ISimpleKeyPairBuffer,
  ISimplePublicKeyOnlyBuffer,
  IStoredMemberKeyDTO,
} from './interfaces';
import { StaticHelpersKeyPair } from './staticHelpers.keypair';
import { BrightChainMemberType } from './memberType';
import { KeyPairSyncResult } from 'crypto';
import { GuidV4, ShortHexGuid } from './guid';
import { MemberKeyType } from './keys/memberKeyType';
import { StoredMemberKey } from './keys/storedMemberKey';
import { MemberKeyStore } from './stores/memberKeyStore';
import { SecureBuffer } from './secureString';
import { KeyType } from './keys/keyType';
import { EmailString } from './emailString';
/**
 * A member of Brightchain.
 * @param id The unique identifier for this member.
 * @param name The name of this member.
 */
export class BrightChainMember implements IReadOnlyBasicObjectDTO {
  private readonly _memberKeyPairs: MemberKeyStore;
  public readonly id: ShortHexGuid;
  public readonly memberType: BrightChainMemberType;
  public readonly name: string;
  public readonly contactEmail: EmailString;
  public readonly creatorId: ShortHexGuid;
  public readonly dateCreated: Date;
  public readonly dateUpdated: Date;
  constructor(
    memberType: BrightChainMemberType,
    name: string,
    contactEmail: EmailString,
    credentialStore?: MemberKeyStore,
    id?: ShortHexGuid,
    dateCreated?: Date,
    dateUpdated?: Date,
    creatorId?: ShortHexGuid
  ) {
    this.memberType = memberType;
    if (id !== undefined) {
      let newGuid: GuidV4;
      try {
        newGuid = new GuidV4(id);
      } catch (e) {
        throw new Error('Invalid member ID');
      }
      this.id = newGuid.asShortHexGuid;
    } else {
      this.id = GuidV4.new().asShortHexGuid;
    }
    this.name = name;
    if (!this.name || this.name.length == 0) {
      throw new Error('Member name missing');
    }
    if (this.name.trim() != this.name) {
      throw new Error('Member name has leading or trailing spaces');
    }
    this.contactEmail = contactEmail;
    
    this._memberKeyPairs = credentialStore ?? new MemberKeyStore();

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

  public loadSigningKeyPair(keyPair: ISimpleKeyPairBuffer) {
    this._memberKeyPairs.set(
      MemberKeyType.Signing,
      StoredMemberKey.newSigningKey(keyPair.publicKey, keyPair.privateKey)
    );
  }

  /**
   * Load a signing key pair for this member.
   * @param keyPair The key pair to load.
   */
  public loadDataKeyPair(keyPair: ISimpleKeyPairBuffer) {
    // challenge the data key pair
    const password: Buffer =
      Buffer.from(StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMember(this));
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
    this._memberKeyPairs.set(
      MemberKeyType.Encryption,
      StoredMemberKey.newEncryptionKey(keyPair.publicKey, keyPair.privateKey)
    );
  }

  public unloadKeyPair(keyType: MemberKeyType) {
    this._memberKeyPairs.has(keyType) && this._memberKeyPairs.remove(keyType);
  }

  public unloadPrivateKey(keyType: MemberKeyType): boolean {
    if (!this._memberKeyPairs.has(keyType)) {
      return false;
    }
    const keyPair = this._memberKeyPairs.get(keyType);
    if (keyPair === undefined) {
      return false;
    }
    const newStoredKey: StoredMemberKey = new StoredMemberKey(
      keyPair.keyType,
      keyPair.keyUse,
      keyPair.publicKey,
      undefined);
    this._memberKeyPairs.set(keyType, newStoredKey);
    return true;
  }

  /**
   * Sign the data using the loaded key pair.
   * @param data
   * @param options
   * @returns
   */
  public sign(data: Buffer, options?: EC.SignOptions): EC.Signature {
    if (!this._memberKeyPairs.has(MemberKeyType.Signing)) {
      throw new Error('No key pair');
    }
    const keyPair: EC.KeyPair = this._memberKeyPairs
      .get(MemberKeyType.Signing)
      .toECKeyPair();
    return StaticHelpersKeyPair.signWithSigningKey(keyPair, data, options);
  }

  /**
   * Verify the data signature using the loaded key pair.
   * @param signature
   * @param data
   * @returns
   */
  public verify(signature: EC.Signature, data: Buffer): boolean {
    if (!this._memberKeyPairs.has(MemberKeyType.Signing)) {
      throw new Error('No key pair');
    }
    const keyPair: EC.KeyPair = this._memberKeyPairs
      .get(MemberKeyType.Signing)
      .toECKeyPair();
    return StaticHelpersKeyPair.verifyWithSigningKey(keyPair, signature, data);
  }

  public rekeySigningKeyPair(): ISigningKeyPrivateKeyInfo {
    const keyPair: EC.KeyPair = this._memberKeyPairs
      .get(MemberKeyType.Signing)
      .toECKeyPair();
    if (!StaticHelpersKeyPair.challengeSigningKeyPair(keyPair)) {
      throw new Error('Invalid current signing key pair');
    }
    const currentKeyPairInfo =
      StaticHelpersKeyPair.getSigningKeyInfoFromKeyPair(keyPair);
    const newSigningKeyPair = StaticHelpersKeyPair.regenerateSigningKeyPair(
      currentKeyPairInfo.mnemonic
    );

    // get data private key with current passphrase, convert to new passphrase
    // const currentSigningKeyPassphrase =
    //   StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMemberId(
    //     this.id,
    //     this.signingKeyPair
    //   );
    const newSigningKeyPassphrase =
      Buffer.from(StaticHelpersKeyPair.signingKeyPairToKeyPassphraseFromMemberId(
        this.id,
        newSigningKeyPair.keyPair,
        MemberKeyType.Signing
      ));

    // using the current signing key prhase, decrypt the data key pair
    const decryptedDataPrivateKey =
      StaticHelpersKeyPair.recoverDataKeyFromSigningKey(this).toString('utf8');
    // make a key pair sync result encryptPrivateKeyData can use
    const newKpSyncResult: KeyPairSyncResult<string, string> = {
      publicKey: newSigningKeyPair.publicKey.toString('utf8'),
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

    this._memberKeyPairs.set(
      MemberKeyType.Signing,
      new StoredMemberKey(
        KeyType.Rsa4096,
        MemberKeyType.Signing,
        Buffer.from(
          newSigningKeyPair.keyPair.getPrivate().toString('hex'),
          'hex'
        ),
        Buffer.from(newSigningKeyPair.keyPair.getPublic('hex'), 'hex')
      )
    );
    return newSigningKeyPair;
  }

  public hasKey(keyType: MemberKeyType): boolean {
    return this._memberKeyPairs.has(keyType);
  }

  public hasPrivateKey(keyType: MemberKeyType): boolean {
    if (!this.hasKey(keyType)) {
      return false;
    }
    return this._memberKeyPairs.get(keyType).hasPrivateKey;
  }

  public getKey(keyType: MemberKeyType): StoredMemberKey | undefined {
    if (!this._memberKeyPairs.has(keyType)) {
      return undefined;
    }
    return this._memberKeyPairs.get(keyType);
  }

  public getOrCreate(keyType: MemberKeyType, creationFunctionIfUndefined: () => StoredMemberKey): StoredMemberKey {
    const key: StoredMemberKey | undefined = this.getKey(keyType);
    if (key !== undefined) {
      return key;
    }
    const newKey: StoredMemberKey = creationFunctionIfUndefined();
    if (newKey.keyUse !== keyType) {
      throw new Error('Invalid key type');
    }
    this._memberKeyPairs.set(keyType, newKey);
    return newKey;
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
    contactEmail: EmailString,
    creator?: BrightChainMember
  ): BrightChainMember {
    const newId = new GuidV4(uuid.v4()).asShortHexGuid;
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    const keyStore = new MemberKeyStore();
    keyStore.set(
      MemberKeyType.Signing,
      StoredMemberKey.newSigningKey(
        Buffer.from(keyPair.signing.getPublic('hex'), 'hex'),
        Buffer.from(keyPair.signing.getPrivate('hex'), 'hex')
      )
    );
    keyStore.set(
      MemberKeyType.Encryption,
      StoredMemberKey.newEncryptionKey(
        keyPair.data.publicKey,
        keyPair.data.privateKey
      )
    );
    return new BrightChainMember(
      memberType,
      name,
      contactEmail,
      keyStore,
      newId,
      undefined,
      undefined,
      creator?.id ?? newId
    );
    // TODO: question: should creatorId only be allowed to be the same as the ID for the first member/node agent/creator?
  }

  toJSON(): string {
    const dataKeyPair = this._memberKeyPairs.has(MemberKeyType.Encryption)
      ? this._memberKeyPairs.get(MemberKeyType.Encryption)
      : undefined;
    const signingKeyPair = this._memberKeyPairs.get(MemberKeyType.Signing)
      ? this._memberKeyPairs.get(MemberKeyType.Signing)
      : undefined;
    const memberKeys: { [key: string]: IStoredMemberKeyDTO } = {};
    if (dataKeyPair) {
      memberKeys[MemberKeyType.Encryption] = dataKeyPair.toJSON();
    }
    if (signingKeyPair) {
      memberKeys[MemberKeyType.Signing] = signingKeyPair.toJSON();
    }
    const memberDTO: IMemberDTO = {
      id: this.id,
      type: this.memberType,
      name: this.name,
      contactEmail: this.contactEmail.toJSON(),
      keys: memberKeys,
      createdBy: this.creatorId as string,
      dateCreated: this.dateCreated,
      dateUpdated: this.dateUpdated,
    };

    return JSON.stringify(memberDTO);
  }
  fromJSON(json: string): BrightChainMember {
    const parsedMember: IMemberDTO = JSON.parse(json) as IMemberDTO;
    console.log('parsedMember', parsedMember);
    const keyStore = new MemberKeyStore();
    if (parsedMember.keys) {
      Object.keys(parsedMember.keys).forEach((keyType) => {
        const key = parsedMember.keys[keyType as MemberKeyType];
        keyStore.set(
          keyType as MemberKeyType,
          new StoredMemberKey(
            key.keyType,
            key.keyUse,
            Buffer.from(key.publicKey, 'hex'),
            key.privateKey
              ? Buffer.from(key.privateKey, 'hex')
              : undefined
          )
        );
      });
    }
    const contactEmail = new EmailString(parsedMember.contactEmail);

    return new BrightChainMember(
      parsedMember.type,
      parsedMember.name,
      contactEmail,
      keyStore,
      parsedMember.id as ShortHexGuid,
      parsedMember.dateCreated,
      parsedMember.dateUpdated,
      parsedMember.createdBy as ShortHexGuid
    );
  }
}
