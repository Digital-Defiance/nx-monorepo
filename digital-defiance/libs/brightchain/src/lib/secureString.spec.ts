import { randomBytes } from "crypto";
import { SecureBuffer } from "./secureString";

describe('SecureStringBuffer', () => {
    it('should create an instance', () => {
        // get 32 random secure bytes
        const randomBytesBuffer = Buffer.from(randomBytes(32));
        expect(randomBytesBuffer).toBeInstanceOf(Buffer);
        expect(randomBytesBuffer.length).toBe(32);
        const secureString: SecureBuffer = new SecureBuffer(randomBytesBuffer);
        expect(secureString).toBeInstanceOf(SecureBuffer);
        expect(secureString.length).toBe(randomBytes.length);
        const decryptedValue = secureString.value;
        expect(decryptedValue.length).toEqual(randomBytes.length);
        expect(decryptedValue).toEqual(randomBytes);
    });
});