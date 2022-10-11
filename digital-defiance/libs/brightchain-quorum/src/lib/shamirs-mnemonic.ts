import { IMnemonic, IMnemonicEntry } from './interfaces';
import { extractShareComponents, random, share } from 'secrets.js-34r7h';
import ShamirShareDetail from './shamir-share-detail';

export default class ShamirsMnemonic implements IMnemonic {
  private readonly words: Array<string> = [];
  private readonly dictionaryWords: Array<string> = [];
  constructor(dictionaryWords: Array<string>, wordCount = 24) {
    this.dictionaryWords = dictionaryWords;
    this.words = this.GenerateMnemonicString(wordCount, dictionaryWords).words;
  }
  public GenerateCheckWord(phrase: string[], wordlist: string[]): string {
    throw new Error('Method not implemented.');
  }
  public GenerateMnemonicString(
    wordCount = 24,
    wordlist: string[]
  ): IMnemonicEntry {
    const shareWords: string[] = new Array<string>(wordCount);
    const shareComponents: ShamirShareDetail[] = new Array(wordCount);
    const bitGroups: string[] = new Array<string>(wordCount);

    // create wordCount shares with a threshold of wordCount.
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;

    // if the dictionary is 2048 words (the currently selected english dictionary is 2048 words),
    // we will need 11 bits to represent the index of each word (2^11 = 2048)
    // this is the number of bits needed to represent the highest index in the dictionary
    const bitsNeededPerDictionaryWord = Math.ceil(Math.log2(dictionarySize));
    const totalBitsRequiredToRepresentWordCount = wordCount * bitsNeededPerDictionaryWord;

    // generate the random bytes needed to represent the wordCount
    // random function takes a number of bits, not bytes.
    const dataToShareInHexString = random(totalBitsRequiredToRepresentWordCount);
    // expected length is totalBitsRequiredToRepresentWordCount / 8 (bits per byte)

    // the share function divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
    // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
    // requiring `threshold` number of shares to reconstruct the secret.

    // shamir's secret sharing algoritm 

    const shares = share(dataToShareInHexString, wordCount, wordCount);
    for (let i = 0; i < sharesRequired; i++) {
      shareComponents[i] = ShamirShareDetail.fromShare(shares[i]);
    }
    console.log(shareComponents);
    // join the groups of 8 bits (represented in hex as 16 characters) from each share and then split into groups of of bitsPerWord
    const joinedBits = shareComponents.map((s) => s.data).join('');
    // joinedBits is a string in hex so the length is 2x the number of bytes, and then 1/8th the number of bits
    // joinedBits should now have a length of 
    if (joinedBits.length !== totalBitsRequiredToRepresentWordCount) {
        throw new Error(
            `Joined bits length is ${joinedBits.length} but should be ${8 *
                sharesRequired}`
        );
    }
    console.log(shares, shareComponents, shareWords);
    throw new Error('not implemented');
  }
  public ValidateMnemonicString(phrase: string, wordlist: string[]): boolean {
    throw new Error('Method not implemented.');
  }
  public MnemonicStringToSeed(phrase: string[], wordlist: string[]): Buffer {
    throw new Error('Method not implemented.');
  }
  public SeedToMnemonicString(
    seed: Buffer,
    wordlist: string[],
    wordCount = 24
  ): string[] {
    throw new Error('Method not implemented.');
  }
}
