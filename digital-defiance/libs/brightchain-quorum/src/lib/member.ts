import * as uuid from 'uuid';
import { randomBytes, createECDH, ECDH } from 'crypto';
import { ec, curves } from 'elliptic';
import {
  entropyToMnemonic,
  generateMnemonic,
  mnemonicToSeedSync,
  mnemonicToEntropy,
} from 'bip39';

/**
 * A member of a Brightchain Quorum.
 * @param id The unique identifier for this member.
 * @param name The name of this member.
 */
export default class QuorumMember {
  private static readonly _mnemonicStrength: number = 256;
  public readonly id: string;
  public readonly name: string;
  public readonly contactEmail: string;
  public readonly cryptoKeyPair: {
    publicKey: string;
    privateKey: string;
  };
  private readonly dateCreated: Date;
  private readonly dateUpdated: Date;
  constructor(
    name: string,
    contactEmail: string,
    keyPair: {
      publicKey: string;
      privateKey: string;
    }
  ) {
    this.dateCreated = new Date();
    this.id = uuid.v4();
    this.name = name;
    this.contactEmail = contactEmail;
    this.cryptoKeyPair = keyPair;
    // TODO: sign dateCreated + id + name + contactEmail using cryptoKeyPair
    // all done: update dateUpdated
    this.dateUpdated = new Date(); // may be slightly later than dateCreated
  }
  public static generateKeyPair(salt?: string): {
    publicKey: string;
    privateKey: string;
    seedHex: string;
    entropy: string;
    mnemonic: string;
  } {
    const mnemonic = generateMnemonic(256);
    const entropy = mnemonicToEntropy(mnemonic);
    const seedBytes = mnemonicToSeedSync(mnemonic, salt);
    const curve = new ec('ed25519');
    const kp = curve.genKeyPair({
      entropy: seedBytes.toString('hex'),
      entropyEnc: 'hex',
    });
    return {
      publicKey: kp.getPublic('hex'),
      privateKey: kp.getPrivate('hex'),
      seedHex: seedBytes.toString('hex'),
      entropy: entropy,
      mnemonic: mnemonic,
    };
  }
  public static regenerateKeyPair(
    mnemonic: string,
    salt?: string
  ): {
    publicKey: string;
    privateKey: string;
    seedHex: string;
    entropy: string;
    mnemonic: string;
  } {
    const seedBytes = mnemonicToSeedSync(mnemonic, salt);
    const entropy = mnemonicToEntropy(mnemonic);
    const curve = new ec('ed25519');
    const kp = curve.genKeyPair({
      entropy: seedBytes.toString('hex'),
      entropyEnc: 'hex',
    });
    return {
      publicKey: kp.getPublic('hex'),
      privateKey: kp.getPrivate('hex'),
      seedHex: seedBytes.toString('hex'),
      entropy: entropy,
      mnemonic: mnemonic,
    };
  }
}
