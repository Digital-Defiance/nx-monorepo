import { IMnemonic } from './interfaces';
import { extractShareComponents, random, share } from 'secrets.js-34r7h';
import ShamirShareDetail from './shamir-share-detail';

export default class ShamirsMnemonic implements IMnemonic {
  private readonly words: Array<string> = [];
  private readonly checkWord: string;
  private readonly dictionaryWords: Array<string> = [];
  constructor(dictionaryWords: Array<string>, wordCount = 24) {
    this.dictionaryWords = dictionaryWords;
    const r = this.GenerateMnemonicString(wordCount, dictionaryWords);
    this.words = r.phrase.split(' ');
    this.checkWord = r.checkWord;
  }
  public GenerateCheckWord(phrase: string, wordlist: string[]): string {
    throw new Error('Method not implemented.');
  }
  public GenerateMnemonicString(
    wordCount = 24,
    wordlist: string[]
  ): { phrase: string; checkWord: string } {
    /**
     * An array of wordCount strings, each of which is a random word from the wordlist.
     */
    const shareWords: string[] = new Array<string>(wordCount);
    /**
     * An array containing the share details for each share word.
     */
    const shareComponents: ShamirShareDetail[] = new Array(wordCount);

    // create wordCount shares with a threshold of wordCount.
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length; // 2048

    // if the dictionary is 2048 words (the currently selected english dictionary is 2048 words),
    // we will need 11 bits to represent the index of each word (2^11 = 2048)
    // this is the number of bits needed to represent the highest index in the dictionary
    const bitsNeededPerDictionaryWord = Math.ceil(Math.log2(dictionarySize)); // 11
    const totalBitsRequiredToRepresentWordCount =
      wordCount * bitsNeededPerDictionaryWord; // 11 * 24 = 264
    const totalBytesRequiredToRepresentWordCount = Math.ceil(
      totalBitsRequiredToRepresentWordCount / 8
    ); // 33
    // when we split the 33 bytes into 24 shares, we will end up with 1.72 bytes/share and need 2 bytes per share
    // so our actual share size will be 2 bytes * 24 = 48 bytes
    const bytesPerShare = Math.ceil(
      totalBytesRequiredToRepresentWordCount / wordCount
    ); // 2 bytes per share

    const totalBitsRequiredToRepresentWordCountAfterPadding =
      bytesPerShare * wordCount * 8; // 2 * 24 * 8 = 384

    // generate the random bytes needed to represent the wordCount
    // random function takes a number of bits, not bytes.
    const dataToShareInHexString = random(
      totalBitsRequiredToRepresentWordCountAfterPadding
    ); // 384
    // expected length is totalBitsRequiredToRepresentWordCountAfterPadding / 8 (bits per byte) * 2 (hex) = 96
    if (
      dataToShareInHexString.length !==
      (totalBitsRequiredToRepresentWordCountAfterPadding / 8) * 2
    ) {
      throw new Error('Unexpected length of random data');
    }

    // the share function divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
    // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
    // requiring `threshold` number of shares to reconstruct the secret.

    // For example for a default word count of 24 and a dictionary size of 2048, we will need 11 bits to represent each word.
    // We will need 24 * 11 = 264 bits to represent the 24 words.
    // We will need 264 / 8 = 33 bytes to represent the 24 words.
    // we will share the 33 bytes into 24 shares, and require 24 shares to reconstruct the secret.
    // the share function will return an array of 24 hex strings, each string representing a share.

    const shares = share(dataToShareInHexString, wordCount, wordCount);

    for (let i = 0; i < wordCount; i++) {
      shareComponents[i] = ShamirShareDetail.fromShare(shares[i]);
    }
    const joinedDataHex = shareComponents.map((s) => s.data).join(''); // ends up being 3072 bytes
    // joinedDataHex is a string in hex so the length is 2x the number of actual bytes
    // joinedDataHex should now have a length of 3072. 3072/2=1536 bytes. 1536/24=64 bytes per share.
    // i'm not sure how the shamir math ends up making it 64 bytes.
    const expectedBytesPerShare = Math.ceil(
      joinedDataHex.length / (2 * wordCount)
    ); // 64

    // so now we will walk through the 24 shares and extract the 11 bits needed to represent each word.
    for (let i=0; i<wordCount; i++) {
      const shareComponent = shareComponents[i];
      shareWords[i] = this.dictionaryWords[shareComponent.dictionaryIndex(this.dictionaryWords)]
    }
    throw new Error('not implemented');
  }
  public ValidateMnemonicString(phrase: string, wordlist: string[]): boolean {
    throw new Error('Method not implemented.');
  }
  public MnemonicStringToSeed(phrase: string, wordlist: string[]): Buffer {
    throw new Error('Method not implemented.');
  }
  public SeedToMnemonicString(
    seed: Buffer,
    wordlist: string[],
    wordCount = 24
  ): string {
    throw new Error('Method not implemented.');
  }
}
