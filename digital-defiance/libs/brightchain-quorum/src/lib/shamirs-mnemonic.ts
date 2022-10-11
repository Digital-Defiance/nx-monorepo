import { IMnemonic, IMnemonicEntry } from './interfaces';
import { random, share } from 'secrets.js-34r7h';

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
    // create wordCount shares with a threshold of wordCount.
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsRequired = Math.ceil(Math.log2(dictionarySize));

    const shareBits = random(bitsRequired);
    const shares = share(shareBits, wordCount, wordCount);

    console.log('shares', shares);
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
