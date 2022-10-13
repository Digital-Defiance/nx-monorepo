import QuorumMember from './member';

export default class BrightchainQuorum {
  constructor(public readonly name: string) {}

  public async createMember(
    name: string,
    contactEmail: string,
    salt?: string
  ): Promise<QuorumMember> {
    const keyPair = QuorumMember.generateKeyPair(salt);
    return new QuorumMember(name, contactEmail, keyPair);
  }
}
