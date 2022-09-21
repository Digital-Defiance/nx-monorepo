/**
 * @description An enumeration of the types of objects that can be quantized and their data sensitivity.
 */
export enum QuantizedObjectType {
    RawData,
    ScannedMatter,
    ScannedLivingMatter,
    ScannedSentientMatter,
    QuarantinedMatter
}

export default QuantizedObjectType;