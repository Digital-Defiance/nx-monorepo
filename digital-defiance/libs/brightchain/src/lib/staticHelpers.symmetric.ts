import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  publicEncrypt,
  privateDecrypt,
} from 'crypto';
import {
  ISymmetricEncryptionResults,
  ISealResults,
} from './interfaces';
import StaticHelpersKeyPair from './staticHelpers.keypair';
import StaticHelpers from './staticHelpers';

/**
 * @description
 * Static helper functions for BrightChain and BrightChain Quorum. Encryption and other utilities.
 * - Uses secrets.js-34r7h fork of secrets.js for Shamir's Secret Sharing
 * - Uses elliptic for ECDSA
 * - Uses bip39 for BIP39 Mnemonic generation
 * - Uses crypto for AES encryption
 * - Uses crypto for RSA key generation, encryption/decryption
 */
export default abstract class StaticHelpersSymmetric {
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
    const hasToJSON = data && typeof data === 'object' && (data as any).toJSON;
    const dataBuffer =
      useBuffer === true && Buffer.isBuffer(data)
        ? data
        : Buffer.from(hasToJSON ? (data as any).toJSON() : JSON.stringify(data), 'utf8');
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
    const key =
      encryptionKey ?? randomBytes(StaticHelpersKeyPair.SymmetricKeyBytes);
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
      StaticHelpersSymmetric.symmetricDecryptBuffer(encryptedData, key).toString()
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
}
