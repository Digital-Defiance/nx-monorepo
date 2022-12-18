import { BrightChainMember, BrightChainMemberType } from '@digital-defiance/brightchain';
import BrightChainQuorum from './quorum';
describe('quorum', () => {
  it('should create a quorum', () => {
    const nodeOwner = BrightChainMember.newMember(
      BrightChainMemberType.System,
      'Node Owner',
      'owner@example.com'
    );
    const quorum = new BrightChainQuorum(nodeOwner, 'Test Quorum');
    expect(quorum).toBeTruthy();
    expect(quorum.name).toEqual('Test Quorum');
  });
});
