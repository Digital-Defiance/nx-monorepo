import { randomBytes, randomUUID } from 'crypto';
import { BrightChainMember } from './brightChainMember';
import { EmailString } from './emailString';
import { GuidV4, ShortHexGuid } from './guid';
import { MemberKeyType } from './keys/memberKeyType';
import { StoredMemberKey } from './keys/storedMemberKey';
import { BrightChainMemberType } from './memberType';
import { StaticHelpersKeyPair } from './staticHelpers.keypair';
import { MemberKeyStore } from './stores/memberKeyStore';
describe('brightchain', () => {
  const alice = BrightChainMember.newMember(
    BrightChainMemberType.User,
    'Alice Smith',
    new EmailString('alice@example.com')
  );
  const bob = BrightChainMember.newMember(
    BrightChainMemberType.User,
    'Bob Smith',
    new EmailString('bob@example.com')
  );
  const noKeyCharlie = new BrightChainMember(
    BrightChainMemberType.User,
    'Charlie Smith',
    new EmailString('charlie@example.com')
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
          new EmailString('alice@example.com'),
          undefined,
          'x' as ShortHexGuid
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
      new EmailString('dwight@example.com')
    );
    expect(dwight.hasKey(MemberKeyType.Encryption)).toBeTruthy();
    dwight.unloadKeyPair(MemberKeyType.Encryption);
    expect(() => dwight.hasKey(MemberKeyType.Encryption)).toBeFalsy();
    expect(dwight.getKey(MemberKeyType.Encryption)).toBeTruthy();
    dwight.unloadKeyPair(MemberKeyType.Signing);
    expect(() => dwight.hasKey(MemberKeyType.Signing)).toBeFalsy();
  });
  it('should fail if we swap out the signing keys without re-encrypting the data key', () => {
    const edith = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Edith Smith',
      new EmailString('edith@example.com')
    );

    const newSigningKeyPair = StaticHelpersKeyPair.generateSigningKeyPair();
    edith.loadSigningKeyPair(newSigningKeyPair);
    const edithKey = edith.getKey(MemberKeyType.Encryption);
    expect(edithKey).toBeInstanceOf(StoredMemberKey);
    if (!(edithKey instanceof StoredMemberKey)) {
      throw new Error('Not a StoredMemberKey');
    }
    expect(() => edith.loadDataKeyPair(edithKey)).toThrowError(
      'Unable to challenge data key pair with mneomonic from signing key pair'
    );
  });
  it('should let us swap out the signing keys', () => {
    // TODO: make this not fail =(
    const frank = BrightChainMember.newMember(
      BrightChainMemberType.User,
      'Frank Smith',
      new EmailString('frank@example.com')
    );

    const newSigningKeyPair = frank.rekeySigningKeyPair();
    const frankKey = frank.getKey(MemberKeyType.Signing);
    expect(frankKey).toBeInstanceOf(StoredMemberKey);
    if (!(frankKey instanceof StoredMemberKey)) {
      throw new Error('Not a StoredMemberKey');
    }
    expect(frankKey.toECKeyPair()).toEqual(newSigningKeyPair.keyPair);
    expect(
      StaticHelpersKeyPair.challengeSigningKeyPair(newSigningKeyPair.keyPair)
    ).toBeTruthy();
    expect(
      StaticHelpersKeyPair.challengeDataKeyPair(
        frankKey,
        Buffer.from(StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMember(frank))
      )
    ).toBeTruthy();
  });
  it('should fail to create with a made up id', () => {
    expect(
      () =>
        new BrightChainMember(
          BrightChainMemberType.User,
          'alice',
          new EmailString('alice@example.com'),
          undefined,
          'x' as ShortHexGuid
        )
    ).toThrowError('Invalid member ID');
  });
  it('should fail to create a user with no name', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        '',
        new EmailString('alice@example.com')
      )
    ).toThrowError('Member name missing');
  });
  it('should fail to create a user with whitespace at the start or end of their name', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice ',
        new EmailString('alice@example.com')
      )
    ).toThrowError('Member name has leading or trailing spaces');
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        ' alice',
        new EmailString('alice@example.com')
      )
    ).toThrowError('Member name has leading or trailing spaces');
  });
  it('should fail to create a user with no email', () => {
    expect(() =>
      BrightChainMember.newMember(BrightChainMemberType.User, 'alice', new EmailString(''))
    ).toThrowError('Member email missing');
  });
  it('should fail to create a user with an email that has whitespace at the start or end', () => {
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice',
        new EmailString(' alice@example.com')
      )
    ).toThrowError('Eail has leading or trailing spaces');
    expect(() =>
      BrightChainMember.newMember(
        BrightChainMemberType.User,
        'alice',
        new EmailString('alice@example.com ')
      )
    ).toThrowError('Email has leading or trailing spaces');
  });
  it('should fail to create a user with an invalid email', () => {
    expect(() => {
      BrightChainMember.newMember(BrightChainMemberType.User, 'Nope', new EmailString('x!foo'));
    }).toThrowError('Email is invalid');
  });
  it('should check whether a user has a data key pair', () => {
    expect(bob.hasKey(MemberKeyType.Encryption)).toEqual(true);
    expect(bob.hasPrivateKey(MemberKeyType.Encryption)).toEqual(true);
    expect(noKeyCharlie.hasKey(MemberKeyType.Encryption)).toEqual(false);
    expect(noKeyCharlie.hasPrivateKey(MemberKeyType.Encryption)).toEqual(false);
  });
  it('should check whether a user has a signing key pair', () => {
    expect(alice.hasKey(MemberKeyType.Encryption)).toEqual(true);
    expect(alice.hasPrivateKey(MemberKeyType.Encryption)).toEqual(true);
    expect(noKeyCharlie.hasKey(MemberKeyType.Signing)).toEqual(false);
    expect(noKeyCharlie.hasPrivateKey(MemberKeyType.Signing)).toEqual(false);
  });
  it('should throw with an invalid signing key', () => {
    const newId = new GuidV4(randomUUID()).asShortHexGuid;
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    const keyStore = new MemberKeyStore();
    keyStore.set(
      MemberKeyType.Signing,
      StoredMemberKey.newSigningKey(
        Buffer.from(keyPair.signing.getPublic('hex')),
        Buffer.alloc(0))
    );
    keyStore.set(
      MemberKeyType.Encryption,
      StoredMemberKey.newEncryptionKey(
        keyPair.data.publicKey,
        keyPair.data.privateKey)
    );
    expect(() => {
      new BrightChainMember(
        BrightChainMemberType.User,
        'alice',
        new EmailString('alice@example.com'),
        keyStore
      );
    }).toThrowError('Invalid key pair');
  });
  it('should throw with an invalid data key', () => {
    const newId = new GuidV4(randomUUID()).asShortHexGuid;
    const keyPair = StaticHelpersKeyPair.generateMemberKeyPairs(newId);
    const keyStore = new MemberKeyStore();
    keyStore.set(
      MemberKeyType.Signing,
      StoredMemberKey.newSigningKey(
        Buffer.from(keyPair.signing.getPublic('hex'), 'hex'),
        Buffer.from(keyPair.signing.getPrivate('hex'), 'hex')
      ));
    keyStore.set(
      MemberKeyType.Encryption,
      StoredMemberKey.newEncryptionKey(
        keyPair.data.publicKey,
        Buffer.alloc(0)
      ));
        
    expect(() => {
      new BrightChainMember(
        BrightChainMemberType.User,
        'alice',
        new EmailString('alice@example.com'),
        keyStore
      );
    }).toThrowError(
      'Unable to challenge data key pair with mneomonic from signing key pair'
    );
  });
});
