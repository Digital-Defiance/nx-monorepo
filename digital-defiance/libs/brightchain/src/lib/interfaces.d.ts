import { ec } from 'elliptic';

export interface ISimpleKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ISimpleKeyPairBuffer {
  publicKey: Buffer;
  privateKey: Buffer;
}

export interface ISigningKeyInfo {
  keyPair: ec.KeyPair;
  publicKey: Buffer;
  privateKey: Buffer;
  seedHex: string;
  entropy: string;
  mnemonic: string;
}

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

export interface IBasicObject {
  /**
   * ID of the data object. Must be unique, usually UUID v4.
   */
  id: bigint;
  /**
   * The date this object was created
   */
  dateCreated: Date;
}

export interface IBasicDataObject extends IBasicObject {
  /**
   * ID of the data object. checksum of the data.
   */
  id: string;
  /**
   * The data to be stored
   */
  data: Uint8Array;
  /**
   * The ID of the member who created this object
   */
  createdBy: string;
  /**
   * The date this object was created
   */
  dateCreated: Date;
}

export interface IReadOnlyBasicObject extends IBasicObject {
  readonly id: string;
  readonly dateCreated: Date;
}

export interface IReadOnlyDataObject
  extends IBasicDataObject,
    IReadOnlyBasicObject {
  readonly id: string; // checksum
  readonly data: Uint8Array;
  readonly createdBy: string;
  readonly dateCreated: Date;
}
