import { ec } from 'elliptic';
import { ShortHexGuid } from './guid';
import { ChecksumString } from './checksumBrand'
import { KeyType } from './keys/keyType';
import { MemberKeyType } from './keys/memberKeyType';
import { BrightChainMemberType } from './memberType';
import { Brand } from 'ts-brand';
import { SecureBuffer } from './secureString';

export interface ISimplePublicKeyOnly {
  publicKey: string;
}
export type SimplePublicKeyOnly = Brand<ISimplePublicKeyOnly, 'SimplePublicKeyOnly'>;

export interface ISimplePublicKeyOnlyBuffer {
  publicKey: Buffer;
}
export type SimplePublicKeyOnlyBuffer = Brand<ISimplePublicKeyOnlyBuffer, 'SimplePublicKeyOnlyBuffer'>;

export interface ISimpleKeyPair extends ISimplePublicKeyOnly {
  publicKey: string;
  privateKey: Buffer;
}

export type SimpleKeyPair = Brand<SimplePublicKeyOnly, 'SimpleKeyPair'>;

export interface ISimpleKeyPairBuffer extends ISimplePublicKeyOnlyBuffer {
  publicKey: Buffer;
  privateKey: Buffer;
}

export type SimpleKeyPairBuffer = Brand<SimplePublicKeyOnlyBuffer, 'SimpleKeyPairBuffer'>;

export interface ISigningKeyPrivateKeyInfo extends ISimpleKeyPairBuffer {
  keyPair: ec.KeyPair;
  publicKey: Buffer;
  privateKey: Buffer;
  seedHex: string;
  entropy: string;
  mnemonic: string;
}

export type SigningKeyPrivateKeyInfo = Brand<ISigningKeyPrivateKeyInfo, 'SigningKeyPrivateKeyInfo'>;

export interface IDataAndSigningKeys {
  signing: ec.KeyPair;
  data: ISimpleKeyPairBuffer;
}

export interface IDataKeyComponents {
  salt: Buffer;
  iterations: number;
  data: Buffer;
}

export interface IPbkf2Config {
  hashBytes: number;
  saltBytes: number;
  iterations: number;
}

export interface IPbkdf2Result {
  salt: Buffer;
  hash: Buffer;
  iterations: number;
}

export interface ISealResults {
  encryptedData: Buffer;
  encryptedKey: Buffer;
}

export interface ISymmetricEncryptionResults {
  encryptedData: Buffer;
  key: Buffer;
}

export interface Position {
  place: number;
}

export interface IBasicObjectDTO {
  /**
   * ID of the data object. Must be unique, usually UUID v4.
   */
  id: string;
  /**
   * The date this object was created
   */
  dateCreated: Date;
}

export interface IBasicDataObjectDTO extends IBasicObjectDTO {
  /**
   * ID of the data object. checksum of the data.
   */
  id: ChecksumString;
  /**
   * The data to be stored
   */
  data: Uint8Array;
  /**
   * The ID of the member who created this object
   */
  createdBy: ShortHexGuid;
  /**
   * The date this object was created
   */
  dateCreated: Date;
}

export interface IMemberDTO extends IBasicObjectDTO {
  type: BrightChainMemberType;
  name: string;
  contactEmail: string;
  keys: { [key: string]: IStoredMemberKeyDTO };
  createdBy: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface IReadOnlyBasicObjectDTO extends IBasicObjectDTO {
  readonly id: string;
  readonly dateCreated: Date;
}

export interface IReadOnlyDataObjectDTO
  extends IBasicDataObjectDTO,
    IReadOnlyBasicObjectDTO {
  readonly id: ChecksumString;
  readonly data: Uint8Array;
  readonly createdBy: ShortHexGuid;
  readonly dateCreated: Date;
}

export interface IStoredMemberKey
{
    readonly keyType: KeyType;
    readonly keyUse: MemberKeyType;
    readonly publicKey: Buffer;
    readonly privateKey?: Buffer;
}

export interface IStoredMemberKeyDTO
{
    readonly keyType: KeyType;
    readonly keyUse: MemberKeyType;
    readonly publicKey: string;
    readonly privateKey?: string;
}