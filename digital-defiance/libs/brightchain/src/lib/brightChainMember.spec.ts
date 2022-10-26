import { randomBytes, randomUUID } from 'crypto';
import BrightChainMember from './brightChainMember';
import BrightChainMemberType from './memberType';
import StaticHelpersKeyPair from './staticHelpers.keypair';
describe('brightchain', () => {
  const alice = BrightChainMember.newMember(
    BrightChainMemberType.User,
    'Alice Smith',
    'alice@example.com'
  );
  const bob = BrightChainMember.newMember(
    BrightChainMemberType.User,
    'Bob Smith',
    'bob@example.com'
  );
  const noKeyCharlie = new BrightChainMember(
    BrightChainMemberType.User,
    'Charlie Smith',
    'charlie@example.com'
  );
  it('should sign and verify a message for a member', () => {
    const message = Buffer.from('hello world');
    const signature = alice.sign(message);
    const verified = alice.verify(signature, message);
    expect(verified).toBeTruthy();
    expect(alice.verify(signature, Buffer.from('hello worldx'))).toBeFalsy();
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
          BigInt(1)
        )
    ).toThrowError('Invalid member ID');
  });
  it('should fail to sign when there is no signing key', () => {
    expect(() => noKeyCharlie.sign(Buffer.from('hello world'))).toThrowError(
      'No key pair'
    );
  });
  it('should fail to verify when there is no signing key', () => {
    expect(() => {
      const signature = alice.sign(Buffer.from('hello world'));
      noKeyCharlie.verify(signature, Buffer.from('hello world'));
    }).toThrowError('No key pair');
  });
  it('should unload a data keypair or signing key[air when called', () => {
    const dwight = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Dwight Smith',
      'dwight@example.com'
    );
    expect(dwight.dataKeyPair).toBeTruthy();
    dwight.unloadDataKeyPair();
    expect(() => dwight.dataKeyPair).toThrowError('Data key pair not set');
    expect(dwight.signingKeyPair).toBeTruthy();
    dwight.unloadSigningKeyPair();
    expect(() => dwight.signingKeyPair).toThrowError(
      'Signing key pair not set'
    );
  });
  it('should fail if we swap out the signing keys without re-encrypting the data key', () => {
    const edith = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Edith Smith',
      'edith@example.com'
    );

    const newSigningKeyPair = StaticHelpersKeyPair.generateSigningKeyPair();
    edith.loadSigningKeyPair(newSigningKeyPair);
    expect(() => edith.loadDataKeyPair(edith.dataKeyPair)).toThrowError(
      'Unable to challenge data key pair with mneomonic from signing key pair'
    );
  });
  it('should let us swap out the signing keys', () => {
    // TODO: make this not fail =(
    const frank = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Frank Smith',
      'frank@example.com'
    );

    const newSigningKeyPair = frank.rekeySigningKeyPair();
    expect(frank.signingKeyPair).toEqual(newSigningKeyPair.keyPair);
    expect(
      StaticHelpersKeyPair.challengeSigningKeyPair(newSigningKeyPair.keyPair)
    ).toBeTruthy();
    expect(
      StaticHelpersKeyPair.challengeDataKeyPair(
        frank.dataKeyPair,
        StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMember(frank)
      )
    ).toBeTruthy();
  });
  it('should fail to create with a made up id', () => {
    const randIdBytes = Buffer.from(randomBytes(16));
    const randId = BigInt('0x' + randIdBytes.toString('hex'));

    // most if not all 16 byte values are valid. this test may be useless
    expect(
      () =>
        new BrightChainMember(
          BrightChainMemberType.User,
          'alice',
          'alice@example.com',
          undefined,
          undefined,
          randId
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
    expect(bob.hasDataPrivateKey).toEqual(true);
    expect(bob.hasDataKeyPair).toEqual(true);
    expect(noKeyCharlie.hasDataKeyPair).toEqual(false);
    expect(noKeyCharlie.hasDataPrivateKey).toEqual(false);
  });
  it('should check whether a user has a signing key pair', () => {
    expect(alice.hasSigningKeyPair).toEqual(true);
    expect(alice.hasSigningPrivateKey).toEqual(true);
    expect(noKeyCharlie.hasSigningKeyPair).toEqual(false);
    expect(noKeyCharlie.hasSigningPrivateKey).toEqual(false);
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
          publicKey: Buffer.from(keyPair.signing.getPublic('hex'), 'hex'),
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
          publicKey: Buffer.from(keyPair.signing.getPublic('hex'), 'hex'),
          privateKey: Buffer.from(keyPair.signing.getPrivate('hex'), 'hex'),
        },
        {
          publicKey: keyPair.data.publicKey,
          privateKey: Buffer.from([]),
        }
      );
    }).toThrowError('Unable to challenge data key pair with mneomonic from signing key pair');
  });
});
