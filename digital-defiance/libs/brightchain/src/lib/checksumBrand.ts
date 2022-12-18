import { AnyBrand, Brand } from 'ts-brand';
export type ChecksumBuffer = Brand<
  Buffer,
  'Sha3Checksum',
  'ChecksumBuffer'
>;
export type ChecksumString = Brand<
  string,
  'Sha3Checksum',
  'ChecksumString'
>;