import StaticHelpersChecksum from '../staticHelpers.checksum';

export default class Block {
    data: Uint8Array;
    checksum: Buffer;
    constructor(data: Uint8Array) {
        this.data = data;
        this.checksum = StaticHelpersChecksum.calculateChecksum(Buffer.from(data));
    }
}