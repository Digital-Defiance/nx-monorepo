import QuorumMember from './member';
import BrightChainQuorum from './quorum';
import BrightChainMemberType from 'libs/brightchain/src/lib/memberType';
describe('quorum', () => {
  it('should create a quorum', () => {
    const nodeOwner = QuorumMember.newMember(
      BrightChainMemberType.System,
      'Node Owner',
      'owner@example.com'
    );
    const quorum = new BrightChainQuorum(nodeOwner, 'Test Quorum');
    expect(quorum).toBeTruthy();
    expect(quorum.name).toEqual('Test Quorum');
  });
});
