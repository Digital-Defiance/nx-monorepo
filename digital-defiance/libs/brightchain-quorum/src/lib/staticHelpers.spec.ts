import QuorumMember from './member';
import QuorumMemberType from './quorumMemberType';
import StaticHelpers from './staticHelpers';

describe('staticHelpers', () => {
  it('should correctly write a value to a buffer 255', () => {
    const value = 0xffffffff;
    const buffer = StaticHelpers.valueToBuffer(value);
    expect(buffer).toEqual(Buffer.from([255, 255, 255, 255]));
  });
  it('should correctly write a value to a buffer random', () => {
    const randomValue = Math.floor(Math.random() * 0xffffffff);
    const buffer = StaticHelpers.valueToBuffer(randomValue);
    expect(buffer).toEqual(
      Buffer.from([
        randomValue >> 24,
        randomValue >> 16,
        randomValue >> 8,
        randomValue,
      ])
    );
  });
  it('should generate N values of Y bits', () => {
    const N = 10;
    const Y = 8;
    const values = StaticHelpers.GenerateNValuesOfYBits(N, Y);
    expect(values.length).toEqual(N);
    values.forEach((value) => {
      expect(value).toBeLessThanOrEqual(2 ** Y - 1);
    });
  });
  it('should flag when there is a non-user member', () => {
    const alice = QuorumMember.newMember(
      QuorumMemberType.User,
      'alice',
      'alice@example.com'
    );
    const bob = QuorumMember.newMember(
      QuorumMemberType.Admin,
      'bob',
      'bob@example.com'
    );
    const charlie = QuorumMember.newMember(
      QuorumMemberType.System,
      'charlie',
      'charlie@example.com'
    );

    expect(StaticHelpers.membersAreAllUsers([alice, bob])).toEqual(true);

    expect(StaticHelpers.membersAreAllUsers([alice, bob, charlie])).toEqual(
      false
    );
  });
});
