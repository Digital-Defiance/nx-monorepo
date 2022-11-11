import { ec } from 'elliptic';
import { FullHexGuid } from './guid';

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
  id: string;
  /**
   * The data to be stored
   */
  data: Uint8Array;
  /**
   * The ID of the member who created this object
   */
  createdBy: FullHexGuid;
  /**
   * The date this object was created
   */
  dateCreated: Date;
}

export interface IReadOnlyBasicObjectDTO extends IBasicObjectDTO {
  readonly id: string;
  readonly dateCreated: Date;
}

export interface IReadOnlyDataObjectDTO
  extends IBasicDataObjectDTO,
    IReadOnlyBasicObjectDTO {
  readonly id: string; // checksum
  readonly data: Uint8Array;
  readonly createdBy: FullHexGuid;
  readonly dateCreated: Date;
}
