import { randomUUID } from 'crypto';
import BrightChainMember from './brightChainMember';
import BrightChainMemberType from './memberType';
import StaticHelpersKeyPair from './staticHelpers.keypair';
describe('brightchain', () => {
  it('should sign and verify a message for a member', () => {
    const member = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Bob Smith',
      'bob@example.com'
    );
    const message = Buffer.from('hello world');
    const signature = member.sign(message);
    const verified = member.verify(signature, message);
    expect(verified).toBeTruthy();
    expect(member.verify(signature, Buffer.from('hello worldx'))).toBeFalsy();
  });
  it('should fail to create with an invalid id', () => {
    expect(
      () =>
        new BrightChainMember(
          BrightChainMemberType.User,
          'alice',
          'alice@example.com',
          undefined,
          undefined,
          'xxx'
        )
    ).toThrowError('Invalid member ID');
  });
  it('should fail to create a user with no name', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        '',
        'alice@example.com'
      )
    ).toThrowError('Member name missing');
  });
  it('should fail to create a user with whitespace at the start or end of their name', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice ',
        'alice@example.com'
      )
    ).toThrowError('Member name has leading or trailing spaces');
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        ' alice',
        'alice@example.com'
      )
    ).toThrowError('Member name has leading or trailing spaces');
  });
  it('should fail to create a user with no email', () => {
    expect(() =>
      BrightChainMember.newMember(BrightChainMemberType.User, 'alice', '')
    ).toThrowError('Member email missing');
  });
  it('should fail to create a user with an email that has whitespace at the start or end', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice',
        ' alice@example.com'
      )
    ).toThrowError('Member email has leading or trailing spaces');
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice',
        'alice@example.com '
      )
    ).toThrowError('Member email has leading or trailing spaces');
  });
  it('should fail to create a user with an invalid email', () => {
    expect(() => {
      BrightChainMember.newMember(BrightChainMemberType.User, 'Nope', 'x!foo');
    }).toThrowError('Member email is invalid');
  });
  it('should check whether a user has a data key pair', () => {
    const member = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Bob Smith',
      'bob@example.com'
    );
    expect(member.hasDataPrivateKey).toEqual(true);
    expect(member.hasDataKeyPair).toEqual(true);
    const noKeyMember = new BrightChainMember(
      BrightChainMemberType.User,
      'Charlie Smith',
      'charlie@example.com'
    );
    expect(noKeyMember.hasDataKeyPair).toEqual(false);
    expect(noKeyMember.hasDataPrivateKey).toEqual(false);
  });
  it('should check whether a user has a signing key pair', () => {
    const member = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Alice Smith',
      'alice@example.com'
    );
    expect(member.hasSigningKeyPair).toEqual(true);
    expect(member.hasSigningPrivateKey).toEqual(true);
    const noKeyMember = new BrightChainMember(
      BrightChainMemberType.User,
      'Bob Smith',
      'bob@example.com'
    );
    expect(noKeyMember.hasSigningKeyPair).toEqual(false);
    expect(noKeyMember.hasSigningPrivateKey).toEqual(false);
  });
  it('should throw with an invalid signing key', () => {
    const newId = randomUUID();
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    expect(() => {
      new BrightChainMember(
        BrightChainMemberType.User,
        'alice',
        'alice@example.com',
        {
          publicKey: keyPair.signing.publicKey,
          privateKey: Buffer.from([]),
        },
        {
          publicKey: keyPair.data.publicKey,
          privateKey: keyPair.data.privateKey,
        }
      );
    }).toThrowError('Invalid key pair');
  });
  it('should throw with an invalid data key', () => {
    const newId = randomUUID();
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    expect(() => {
      new BrightChainMember(
        BrightChainMemberType.User,
        'alice',
        'alice@example.com',
        {
          publicKey: keyPair.signing.publicKey,
          privateKey: keyPair.signing.privateKey,
        },
        {
          publicKey: keyPair.data.publicKey,
          privateKey: Buffer.from([]),
        }
      );
    }).toThrowError('Invalid key pair');
  });
});
