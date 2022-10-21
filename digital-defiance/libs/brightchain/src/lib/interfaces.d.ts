export type EncryptedShares = Array<string>;

export interface ISimpleKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ISimpleKeyPairBuffer {
  publicKey: Buffer;
  privateKey: Buffer;
}

export interface ISigningKeyInfo {
  keyPair: kp;
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

export interface IMemberShareCount {
  memberId: string;
  shares: number;
}

export interface ISortedMemberShareCountArrays {
  memberIds: string[];
  shares: number[],
  memberCount: number;
  totalShares: number;
}

export interface ISymmetricEncryptionResults {
  encryptedData: Buffer;
  key: Buffer;
}

export interface Position {
  place: number;
}
