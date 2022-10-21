// TODO: split
import Rand from 'rand-seed';
import { ec as EC } from 'elliptic';
import {
  generateMnemonic,
  mnemonicToSeedSync,
  mnemonicToEntropy,
  entropyToMnemonic,
} from 'bip39';
import BrightChainMember from './brightChainMember';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  RSAKeyPairOptions,
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
  constants as cryptoConstants,
  RsaPublicKey,
  KeyPairSyncResult,
} from 'crypto';
import {
  IDataKeyComponents,
  IDataAndSigningKeys,
  ISigningKeyInfo,
  ISimpleKeyPairBuffer,
  ISymmetricEncryptionResults,
  ISealResults,
} from './interfaces';
import StaticHelpersPbkdf2 from './staticHelpers.pbkdf2';
import StaticHelpers from './staticHelpers';
import StaticHelpersSymmetric from './staticHelpers.symmetric';

/**
 * @description
 * Static helper functions for BrightChain and BrightChain Quorum. Encryption and other utilities.
 * - Uses secrets.js-34r7h fork of secrets.js for Shamir's Secret Sharing
 * - Uses elliptic for ECDSA
 * - Uses bip39 for BIP39 Mnemonic generation
 * - Uses crypto for AES encryption
 * - Uses crypto for RSA key generation, encryption/decryption
 */
export default abstract class StaticHelpersKeyPair {
  /**
   * EC is called with this value
   */
  public static readonly DefaultECMode: string = 'ed25519';

  /**
   * The symmetric algorithm to be used- only AES is supported at this time.
   */
  public static readonly SymmetricKeyAlgorithm = 'aes';
  /**
   * The symmetric algorithm key size
   */
  public static readonly SymmetricKeyBits = 256;

  /**
   * Helper to convert the bits to bytes for the symmetric key size
   */
  public static readonly SymmetricKeyBytes =
    StaticHelpersKeyPair.SymmetricKeyBits / 8;

  /**
   * The symmetric algorithm data mode (CBC/CTR, etc)
   */
  public static readonly SymmetricKeyMode = 'ctr';

  /**
   * The number of bytes to use for the AES IV
   */
  public static readonly SymmetricKeyIvBytes = 16;

  /**
   * The encryption algorithm (cipher) type string to be used.
   * @type {String}
   * @const
   * @private
   */
  public static readonly SymmetricAlgorithmType: string = `${StaticHelpersKeyPair.SymmetricKeyAlgorithm}-${StaticHelpersKeyPair.SymmetricKeyBits}-${StaticHelpersKeyPair.SymmetricKeyMode}`;

  public static readonly Sha3DefaultHashBits: number = 512;

  /**
   * unused/future/unsupported on my platform/version.
   */
  public static readonly EnableOaepHash: boolean = true;

  /**
   * Number of bits in an RSA key used for the data encryption key.
   */
  public static readonly AsymmetricKeyBits: number = 4096;

  /**
   * Mnemonic strength in bits. This will produce a 32-bit key for ECDSA.
   */
  public static readonly MnemonicStrength: number = 256;

  /**
   * Generate an options object for the ECDSA signing key.
   */
  public static get DataKeyPairOptions(): RSAKeyPairOptions<'pem', 'pem'> {
    const args = {
      modulusLength: StaticHelpersKeyPair.AsymmetricKeyBits,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return args;
  }

  /**
   * Returns an options object for RSA publicEncrypt
   * @param keyPair
   * @returns
   */
  public static DataPublicEncryptOptions(publicKey: Buffer): RsaPublicKey {
    return {
      key: publicKey,
      padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING,
      //oaepHash: StaticHelpers.EnableOaepHash ? 'SHA256' : undefined,
    };
  }

  /**
   * Returns an options object for RSA publicEncrypt
   * @param keyPair
   * @returns
   */
  public static DataPublicEncryptOptionsFromKeyPair(
    keyPair: ISimpleKeyPairBuffer
  ): RsaPublicKey {
    return StaticHelpersKeyPair.DataPublicEncryptOptions(keyPair.publicKey);
  }

  /**
   * Returns an options object for RSA privateDecrypt
   * @param privateKey
   * @returns
   */
  public static DataPrivateDecryptOptions(privateKey: Buffer): RsaPublicKey {
    return {
      key: privateKey,
      padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING,
      //oaepHash: StaticHelpers.EnableOaepHash ? 'SHA256' : undefined,
    };
  }

  /**
   * Generates the given number of random values of the specified number of bits, with an optional seed.
   * @param n number of values
   * @param y bits per value
   * @param seed Random number generator seed
   * @returns
   */
  public static GenerateNValuesOfYBits(
    n: number,
    y: number,
    seed?: string
  ): bigint[] {
    const rand = new Rand(seed);
    const values: bigint[] = new Array<bigint>(n);
    const maxValue = BigInt(2) ** BigInt(y + 1) - BigInt(1);
    // 2^y - 1 = maxValue
    // 2^8 - 1 = 255
    // 2^11 - 1 = 2047
    for (let i = 0; i < n; i++) {
      values[i] = BigInt(Math.floor(rand.next() * Number(maxValue)));
    }
    return values;
  }

  /**
   * Write a number to a Buffer as a 32-bit unsigned integer. The buffer will contain 4 bytes.
   * @param value
   * @returns
   */
  public static valueToBuffer(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);
    return buffer;
  }

  /**
   * Generate an Asymmetric data key pair for data encryption to/from members
   * @param password
   * @returns
   */
  public static generateDataKeyPair(
    password: string,
    loopPrevention?: number
  ): ISimpleKeyPairBuffer {
    const keyPairOptions = StaticHelpersKeyPair.DataKeyPairOptions;
    const keyPairResult = generateKeyPairSync('rsa', keyPairOptions);
    const derivedKey = StaticHelpersPbkdf2.deriveKeyFromPassword(password);
    const encryptedPrivateKey = StaticHelpersSymmetric.symmetricEncrypt(
      Buffer.from(keyPairResult.privateKey, 'utf8'),
      derivedKey.hash,
      true
    );
    const privateKeyData = Buffer.concat([
      StaticHelpers.valueToBuffer(derivedKey.salt.length),
      StaticHelpers.valueToBuffer(derivedKey.iterations),
      derivedKey.salt,
      encryptedPrivateKey.encryptedData,
    ]);

    const kpBuffer: ISimpleKeyPairBuffer = {
      publicKey: Buffer.from(keyPairResult.publicKey, 'utf8'),
      privateKey: privateKeyData,
    };

    if (!StaticHelpersKeyPair.challengeDataKeyPair(kpBuffer, password)) {
      const maxTries = 100;
      if (loopPrevention !== undefined && loopPrevention > maxTries) {
        throw new Error(
          `Unable to generate a valid key pair after ${maxTries} tries.`
        );
      }
      return StaticHelpersKeyPair.generateDataKeyPair(
        password,
        loopPrevention ? loopPrevention + 1 : 1
      );
    }

    return {
      publicKey: Buffer.from(keyPairResult.publicKey, 'utf8'),
      privateKey: privateKeyData,
    };
  }

  /**
   * Decrypt an asymmetric data private key from a member
   * @param privateKey
   * @param password
   * @returns
   */
  public static decryptDataPrivateKey(
    privateKey: Buffer,
    password: string
  ): Buffer {
    const keyComponents =
      StaticHelpersKeyPair.extractDataKeyComponents(privateKey);
    const derivedKey = StaticHelpersPbkdf2.deriveKeyFromPassword(
      password,
      keyComponents.salt,
      keyComponents.iterations
    );
    const decryptedPrivateKey = StaticHelpersSymmetric.symmetricDecryptBuffer(
      keyComponents.data,
      derivedKey.hash
    );
    return decryptedPrivateKey;
  }

  /**
   * Extract the salt, iterations, and encrypted data from a data private key buffer
   * @param buf
   * @returns
   */
  public static extractDataKeyComponents(buf: Buffer): IDataKeyComponents {
    const saltLength = buf.readUInt32BE(0);
    const iterations = buf.readUInt32BE(4);
    if (saltLength === 0) {
      throw new Error('Salt length is zero');
    }
    if (iterations === 0) {
      throw new Error('Iterations is zero');
    }
    if (buf.length < saltLength + 8) {
      throw new Error('Buffer length mismatch');
    }
    const uintArrOfBuf = Uint8Array.from(buf);
    const salt: Buffer = Buffer.from(uintArrOfBuf.slice(8, 8 + saltLength));
    const data: Buffer = Buffer.from(uintArrOfBuf.slice(8 + saltLength));
    return {
      salt,
      iterations,
      data,
    };
  }

  /**
   * Test a given RSA key pair to ensure it can decrypt the private key and then encrypt and decrypt a message successfully
   * @param keyPair
   * @param password
   * @returns
   */
  public static challengeDataKeyPair(
    keyPair: ISimpleKeyPairBuffer,
    password: string
  ): boolean {
    try {
      // generate a nonce
      const nonce = randomBytes(32); // arbitrary length
      // encrypt the nonce with the public key
      const encryptedNonce = publicEncrypt(
        StaticHelpersKeyPair.DataPublicEncryptOptionsFromKeyPair(keyPair),
        nonce
      );
      const decryptedPrivateKey = StaticHelpersKeyPair.decryptDataPrivateKey(
        keyPair.privateKey,
        password
      );
      // decrypt the nonce with the private key
      const decryptedNonce = privateDecrypt(
        StaticHelpersKeyPair.DataPrivateDecryptOptions(decryptedPrivateKey),
        encryptedNonce
      );
      if (decryptedNonce.length !== nonce.length) {
        return false;
      }
      // compare the decrypted nonce with the original nonce
      for (let i = 0; i < nonce.length; i++) {
        if (nonce[i] !== decryptedNonce[i]) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public static challengeSigningKeyPair(keyPair: EC.KeyPair): boolean {
    try {
      // generate a nonce
      const nonce = randomBytes(32); // arbitrary length
      // sign the nonce with the private key
      const signature = keyPair.sign(nonce);
      // verify the signature with the public key
      const verified = keyPair.verify(nonce, signature);
      return verified;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate an ED25519 key pair for signing/verifying messages
   * @param salt
   * @returns
   */
  public static generateSigningKeyPair(
    salt?: string,
    loopPrevent?: number
  ): ISigningKeyInfo {
    const mnemonic = generateMnemonic(StaticHelpersKeyPair.MnemonicStrength);
    const entropy = mnemonicToEntropy(mnemonic);
    const seedBytes = mnemonicToSeedSync(mnemonic, salt);
    const curve = new EC(StaticHelpersKeyPair.DefaultECMode);
    const keyPair = curve.genKeyPair({
      entropy: seedBytes.toString('hex'),
      entropyEnc: 'hex',
    });
    // test the key for degenerate keys
    if (!StaticHelpersKeyPair.challengeSigningKeyPair(keyPair)) {
      const attempts = 100;
      if (loopPrevent !== undefined && loopPrevent > attempts) {
        throw new Error(
          'Unable to generate a valid key pair after ' + attempts + ' attempts'
        );
      }
      return StaticHelpersKeyPair.generateSigningKeyPair(
        salt,
        loopPrevent ? loopPrevent + 1 : 1
      );
    }
    const simpleKeyPair =
      StaticHelpersKeyPair.convertSigningKeyPairToISimpleKeyPairBuffer(keyPair);
    return {
      keyPair: keyPair,
      publicKey: simpleKeyPair.publicKey,
      privateKey: simpleKeyPair.privateKey,
      seedHex: seedBytes.toString('hex'),
      entropy: entropy,
      mnemonic: mnemonic,
    };
  }

  /**
   * Given an existing mnemonic phrase, recover the signing key pair
   * @param mnemonic
   * @param salt Only used for the seed generation, which is not currently being used
   * @returns
   */
  public static regenerateSigningKeyPair(
    mnemonic: string,
    salt?: string
  ): ISigningKeyInfo {
    const seedBytes = mnemonicToSeedSync(mnemonic, salt);
    const entropy = mnemonicToEntropy(mnemonic);
    const curve = new EC(StaticHelpersKeyPair.DefaultECMode);
    const keyPair = curve.genKeyPair({
      entropy: seedBytes.toString('hex'),
      entropyEnc: 'hex',
    });
    const simpleKeyPair =
      StaticHelpersKeyPair.convertSigningKeyPairToISimpleKeyPairBuffer(keyPair);
    return {
      keyPair: keyPair,
      publicKey: simpleKeyPair.publicKey,
      privateKey: simpleKeyPair.privateKey,
      seedHex: seedBytes.toString('hex'),
      entropy: entropy,
      mnemonic: mnemonic,
    };
  }

  /**
   * Generate both key pairs for a new member
   * @returns
   */
  public static generateMemberKeyPairs(
    memberId: string,
    loopPrevention?: number
  ): IDataAndSigningKeys {
    // TODO: check for degenerate keys.
    // TODO: verify each key can encrypt and decrypt a message and/or sign/verify a message
    try {
      const signingKey = StaticHelpersKeyPair.generateSigningKeyPair();
      const dataKey = StaticHelpersKeyPair.generateDataKeyPair(
        StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMemberId(
          memberId,
          signingKey.keyPair
        )
      );
      return {
        signing: signingKey.keyPair,
        data: dataKey,
      };
    } catch (e) {
      const attempts = 100;
      if (loopPrevention !== undefined && loopPrevention > attempts) {
        throw new Error(
          `Unable to generate a valid key pair after ${attempts} attempts`
        );
      }
      return StaticHelpersKeyPair.generateMemberKeyPairs(
        memberId,
        loopPrevention ? loopPrevention + 1 : 1
      );
    }
  }

  /**
   * both generateSigningKeyPair and regenerateSigningKeyPair return the same object
   * This is essentially a key info function.
   * @param keyPair
   * @param salt
   * @returns
   */
  public static rebuildSigningKeyPairResultFromKeyPair(
    keyPair: EC.KeyPair,
    salt?: string
  ): ISigningKeyInfo {
    const simpleKeyPair =
      StaticHelpersKeyPair.convertSigningKeyPairToISimpleKeyPairBuffer(keyPair);
    const mnemonic = entropyToMnemonic(
      simpleKeyPair.privateKey.toString('hex')
    );
    const seedBytes = mnemonicToSeedSync(mnemonic, salt);
    const entropy = mnemonicToEntropy(mnemonic);
    return {
      keyPair: keyPair,
      publicKey: simpleKeyPair.publicKey,
      privateKey: simpleKeyPair.privateKey,
      seedHex: seedBytes.toString('hex'),
      entropy: entropy,
      mnemonic: mnemonic,
    };
  }

  /**
   * Use the signging key's private key to produce a mnemonic phrase which encrypted the data key
   * Note that the data key is not itself associated with the signing key,
   * but is stored encrypted using the mnemonic phrase from the signing key
   * @param member
   * @returns
   */
  public static recoverDataKeyFromSigningKey(member: BrightChainMember): Buffer {
    if (!member.hasDataPrivateKey) {
      throw new Error('Member data private key not found');
    }
    // get the bip39 mnemonic from the signing key
    const passPhrase =
      StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMember(member);
    // decrypt the private key
    const decryptedPrivateKey = StaticHelpersKeyPair.decryptDataPrivateKey(
      member.signingPrivateKey,
      passPhrase
    );
    return decryptedPrivateKey;
  }

  /**
   * Use the private key of the signing key pair to produce a deterministic password from the signing key
   * Do not change this as it will break existing data keys
   */
  public static signingKeyPairToDataKeyPassphraseFromMemberId(
    memberId: string,
    signingKeyPair: EC.KeyPair
  ): string {
    const mnemonic = entropyToMnemonic(signingKeyPair.getPrivate('hex'));
    // lets seed the passphrase with the member's id for some more entropy
    return [memberId, '!', mnemonic].join('');
  }

  /**
   * Use the private key of the signing key pair to produce a deterministic password from the signing key
   * Do not change this as it will break existing data keys
   */
  public static signingKeyPairToDataKeyPassphraseFromMember(
    member: BrightChainMember
  ): string {
    return StaticHelpersKeyPair.signingKeyPairToDataKeyPassphraseFromMemberId(
      member.id,
      member.signingKeyPair
    );
  }

  public static signWithSigningKey(
    keyPair: EC.KeyPair,
    data: Buffer,
    options?: EC.SignOptions
  ): EC.Signature {
    const sigData = keyPair.sign(data.toString('hex'), options);
    return sigData;
  }

  public static verifyWithSigningKey(
    keyPair: EC.KeyPair,
    signature: EC.Signature,
    data: Buffer
  ): boolean {
    return keyPair.verify(data.toString('hex'), signature.toDER('hex'));
  }

  /**
   * Encrypt data with AES
   * @param data
   * @param encryptionKey
   * @param useBuffer
   * @returns
   */
  public static symmetricEncrypt<T>(
    data: T,
    encryptionKey?: Buffer,
    useBuffer?: boolean
  ): ISymmetricEncryptionResults {
    const dataBuffer =
      useBuffer === true && Buffer.isBuffer(data)
        ? data
        : Buffer.from(JSON.stringify(data), 'utf8');
    if (
      encryptionKey &&
      encryptionKey.length != StaticHelpersKeyPair.SymmetricKeyBytes
    )
      throw new Error(
        `Encryption key must be ${StaticHelpersKeyPair.SymmetricKeyBytes} bytes long`
      );

    // encrypt the document using AES-256 and the key
    // Initialization Vector
    const ivBuffer = randomBytes(StaticHelpersKeyPair.SymmetricKeyIvBytes);
    const key = encryptionKey ?? randomBytes(this.SymmetricKeyBytes);
    const cipher = createCipheriv(
      StaticHelpersKeyPair.SymmetricAlgorithmType,
      key,
      ivBuffer
    );

    const ciphertextBuffer = cipher.update(dataBuffer);
    const encryptionIvPlusData = Buffer.concat([
      ivBuffer,
      ciphertextBuffer,
      cipher.final(),
    ]);
    return {
      encryptedData: encryptionIvPlusData,
      key: key,
    };
  }

  /**
   * Decrypt the given buffer with AES, as a buffer
   * @param encryptedData
   * @param key
   * @returns
   */
  public static symmetricDecryptBuffer(
    encryptedData: Buffer,
    key: Buffer
  ): Buffer {
    const ivBuffer = encryptedData.slice(
      0,
      StaticHelpersKeyPair.SymmetricKeyIvBytes
    );
    const ciphertextBuffer = encryptedData.slice(
      StaticHelpersKeyPair.SymmetricKeyIvBytes
    );
    const decipher = createDecipheriv(
      StaticHelpersKeyPair.SymmetricAlgorithmType,
      key,
      ivBuffer
    );
    const decryptedDataBuffer = decipher.update(ciphertextBuffer);
    return decryptedDataBuffer;
  }

  /**
   * Decrypt the given buffer with AES, treat as JSON and cast to a type
   * @param encryptedData
   * @param key
   * @returns
   */
  public static symmetricDecrypt<T>(encryptedData: Buffer, key: Buffer): T {
    return JSON.parse(
      StaticHelpersSymmetric.symmetricDecryptBuffer(
        encryptedData,
        key
      ).toString()
    ) as T;
  }

  public static seal<T>(data: T, publicKey: Buffer): ISealResults {
    // encrypt the data with a new symmetric key
    const encrypted = StaticHelpersSymmetric.symmetricEncrypt<T>(data);
    // encrypt the symmetric key with the asymmetric key for the user
    const encryptedData = publicEncrypt(
      StaticHelpersKeyPair.DataPublicEncryptOptions(publicKey),
      encrypted.key
    );
    // return the encrypted symmetric key and the encrypted data
    return {
      encryptedData: encrypted.encryptedData,
      encryptedKey: encryptedData,
    };
  }

  public static ISealResultsToBuffer(results: ISealResults): Buffer {
    return Buffer.concat([
      StaticHelpers.valueToBuffer(results.encryptedKey.length),
      results.encryptedKey,
      StaticHelpers.valueToBuffer(results.encryptedData.length),
      results.encryptedData,
    ]);
  }

  public static BufferToISealResults(buffer: Buffer): ISealResults {
    const encryptedKeyLength = buffer.readUInt32BE(0);
    const encryptedKey = buffer.slice(4, 4 + encryptedKeyLength);
    const encryptedDataLength = buffer.readUInt32BE(4 + encryptedKeyLength);
    const encryptedData = buffer.slice(
      4 + encryptedKeyLength + 4,
      4 + encryptedKeyLength + 4 + encryptedDataLength
    );
    return {
      encryptedKey: encryptedKey,
      encryptedData: encryptedData,
    };
  }

  public static unseal<T>(sealedData: ISealResults, privateKey: Buffer) {
    // decrypt the symmetric key with the private key
    const decryptedKey = privateDecrypt(
      StaticHelpersKeyPair.DataPrivateDecryptOptions(privateKey),
      sealedData.encryptedKey
    );
    // decrypt the data with the symmetric key
    const decryptedData = StaticHelpersSymmetric.symmetricDecrypt<T>(
      sealedData.encryptedData,
      decryptedKey
    );
    return decryptedData;
  }

  public static convertSigningKeyPairToISimpleKeyPairBuffer(
    keyPair: EC.KeyPair
  ): ISimpleKeyPairBuffer {
    return {
      publicKey: Buffer.from(keyPair.getPublic('hex'), 'hex'),
      privateKey: Buffer.from(keyPair.getPrivate('hex'), 'hex'),
    };
  }
}
