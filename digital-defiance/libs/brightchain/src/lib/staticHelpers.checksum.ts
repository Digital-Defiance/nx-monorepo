import { createHash } from 'crypto';

/**
 * @description
 * Static helper functions for BrightChain and BrightChain Quorum. Encryption and other utilities.
 * - Uses secrets.js-34r7h fork of secrets.js for Shamir's Secret Sharing
 * - Uses elliptic for ECDSA
 * - Uses bip39 for BIP39 Mnemonic generation
 * - Uses crypto for AES encryption
 * - Uses crypto for RSA key generation, encryption/decryption
 */
export default abstract class StaticHelpersChecksum {
  public static readonly Sha3DefaultHashBits: number = 512;

  public static CryptoChecksumVerificationAlgorithm(bits: number): string {
    return `sha3-${bits.toString()}`;
  }

  /**
   * unused/future/unsupported on my platform/version.
   */
  public static readonly EnableOaepHash: boolean = true;

  public static calculateChecksum(data: Buffer): Buffer {
    return Buffer.from(
      createHash(
        StaticHelpersChecksum.CryptoChecksumVerificationAlgorithm(
          StaticHelpersChecksum.Sha3DefaultHashBits
        )
      )
        .update(data)
        .digest('hex'),
      'hex'
    );
  }

  public static validateChecksum(data: Buffer, checksum: Buffer): boolean {
    const calculatedChecksum = StaticHelpersChecksum.calculateChecksum(data);
    return (
      calculatedChecksum.length == checksum.length &&
      calculatedChecksum.equals(checksum)
    );
  }
}
