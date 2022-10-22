export type EncryptedShares = Array<string>;

export interface IQoroumSealResults {
  keyShares: Shares;
  record: QuorumDataRecord;
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
