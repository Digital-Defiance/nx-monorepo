import { FullHexGuid, GuidV4 } from './guid';
import { StaticHelpersKeyPair } from './staticHelpers.keypair';
import { StaticHelpersPbkdf2 } from './staticHelpers.pbkdf2';

/**
 * A secure string buffer is a buffer whose intent is to prevent the raw password from being stored in memory.
 * The buffer is encrypted with a key derived from a GUID.
 * The GUID is stored in the clear, but the buffer is encrypted with a key derived from the GUID.
 * This allows the buffer to be decrypted, but only if the GUID is known.
 */
export class SecureBuffer
{
    private readonly _id: GuidV4;
    private readonly _length: number;
    private readonly _encryptedValue: Buffer;
    private readonly _salt: Buffer;
    constructor(data?: Buffer) {
        this._id = GuidV4.new();
        // don't bother encrypting an empty buffer
        if (data === undefined || data.length === 0) {
            this._length = 0;
            this._encryptedValue = Buffer.alloc(0);
            this._salt = Buffer.alloc(0);
            return;
        }
        this._length = data.length;
        const idKey = StaticHelpersPbkdf2.deriveKeyFromPassword(this._id.asShortHexGuidBuffer);
        const encryptionResult = StaticHelpersKeyPair.symmetricEncryptBuffer(data, idKey.hash);
        this._encryptedValue = encryptionResult.encryptedData;
        this._salt = idKey.salt;
    }
    public static fromString(data: string, encoding?: BufferEncoding): SecureBuffer {
        return new SecureBuffer(Buffer.from(data, encoding));
    }
    public get id(): FullHexGuid {
        return this._id.asFullHexGuid;
    }
    public get length(): number {
        return this._length;
    }
    public get value(): Buffer {
        if (this._length === 0) {
            return Buffer.alloc(0);
        }
        const idKey = StaticHelpersPbkdf2.deriveKeyFromPassword(this._id.asShortHexGuidBuffer, this._salt);
        const decryptionResult = StaticHelpersKeyPair.symmetricDecryptBuffer(this._encryptedValue, idKey.hash);
        if (decryptionResult.length !== this._length) {
            throw new Error('Decrypted value length does not match expected length');
        }
        return decryptionResult;
    }
    public get valueAsString(): string {
        return this.value.toString();
    }
    public get valueAsUtf8String(): string {
        return this.value.toString('utf8');
    }
    public get valueAsHexString(): string {
        return this.value.toString('hex');
    }
    public get valueAsBase64String(): string {
        return this.value.toString('base64');
    }
}