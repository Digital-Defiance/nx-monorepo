export enum KeyType {
  Ed25519 = 'ED25519',
  Rsa4096 = 'RSA4096',
}

export type KeyTypeString = KeyType.Ed25519 | KeyType.Rsa4096;
