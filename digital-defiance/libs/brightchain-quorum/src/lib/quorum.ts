import QuorumMember from './member';

export default class BrightchainQuorum {
  public readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  public async createMember(
    name: string,
    contactEmail: string,
    salt?: string
  ): Promise<QuorumMember> {
    const keyPair = QuorumMember.generateKeyPair(salt);
    return new QuorumMember(name, contactEmail, keyPair);
  }
}
