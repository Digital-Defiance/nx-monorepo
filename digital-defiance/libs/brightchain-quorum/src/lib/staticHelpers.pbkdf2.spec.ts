import StaticHelpersPbkdf2 from './staticHelpers.pbkdf2';

describe('brightchainQuorum', () => {
  it('should derive the same password twice', () => {
    const password = 'password';
    const derivedKey = StaticHelpersPbkdf2.deriveKeyFromPassword(password);
    const derivedKey2 = StaticHelpersPbkdf2.deriveKeyFromPassword(
      password,
      derivedKey.salt,
      derivedKey.iterations
    );
    expect(derivedKey.hash).toEqual(derivedKey2.hash);
  });
  it('should do the correct number of pbkdf2 iterations in a second', () => {
    const timedRun = StaticHelpersPbkdf2.timedPbkdf2Test();
    const threshold = 25; // if we are within 25 msec of 1 second, we are done
    expect(timedRun).toBeGreaterThan(1000 - threshold);
    expect(timedRun).toBeLessThan(1000 + threshold);
  });
});
