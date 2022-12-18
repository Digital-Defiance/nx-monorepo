import { Brand } from "ts-brand";

export enum MemberKeyType
{
    Authentication = 'Authentication',
    Encryption = 'Encryption',
    Signing = 'Signing',
}

export type MemberKeyTypeBrand = Brand<MemberKeyType, 'MemberKey', 'MemberKeyType'>;
export type AuthenticationKey = Brand<MemberKeyType, 'MemberKey', MemberKeyType.Authentication>;
export type EncryptionKey = Brand<MemberKeyType, 'MemberKey', MemberKeyType.Encryption>;
export type SigningKey = Brand<MemberKeyType, 'MemberKey', MemberKeyType.Signing>;
