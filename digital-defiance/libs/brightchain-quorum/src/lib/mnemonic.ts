import { randomBytes } from 'crypto';
import {
  randChoice,
  randomBigint,
} from '../../../stargate-256-core/src/lib/util';
import Rand from 'rand-seed';
import { IMnemonic } from './interfaces';

/**
 * Class to facilitate the generation of a mnemonic phrase and the conversion of a mnemonic phrase to a seed.
 * The mnemonic has a checksum builtin.
 * This is a non-standard approach.  The standard approach is to use the bip39 library directly. We are only
 * using the wordlists from that library.
 * It is based loosely on bip39, but with a few differences:
 * - an additional checksum word is added to the end of the mnemonic phrase
 * - the checksum word is not part of the seed
 * - the checksum word is purely for validation purposes
 */
export default class Mnemonic implements IMnemonic {
  public PhraseToValues(phrase: string, wordlist: string[]): bigint[] {
    const words = phrase.split(' ');
    const wordValues: bigint[] = new Array<bigint>();
    for (const word of words) {
      const index = wordlist.indexOf(word);
      if (index === -1) throw new Error('Invalid mnemonic word');
      wordValues.push(BigInt(index));
    }
    return wordValues;
  }
  public GenerateCheckWord(phrase: string, wordlist: string[]): string {
    const words = phrase.split(' ');
    const wordCount = words.length;
    const wordValues = this.PhraseToValues(phrase, wordlist);
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsRequired = Math.ceil(Math.log2(dictionarySize));
    // create an array of the bit groupings
    const bitGroups: string[] = new Array<string>(wordCount);
    const groupValues: bigint[] = new Array(wordCount);

    // say we have 24 words, each word is 11 bits, so we have 264 bits
    // either xor all the words together, or add them together and use a modulo
    // why not do both
    let xorValue = BigInt(0);
    let addValue = BigInt(0);
    for (let i = 0; i < wordCount; i++) {
      const wordBits = wordValues[i].toString(2).padStart(bitsRequired, '0');
      bitGroups[i] = wordBits;
      groupValues[i] = BigInt('0b' + wordBits);
      xorValue ^= groupValues[i];
      addValue += groupValues[i];
    }
    const wordIndex = xorValue ^ addValue % BigInt(dictionarySize);
    return wordlist[Number(wordIndex)];
  }

  public GenerateNValuesOfYBits(n: number, y: number, seed?: string): bigint[] {
    const rand = new Rand(seed);
    const values: bigint[] = new Array<bigint>(n);
    const maxValue = BigInt(2) ** BigInt(y + 1) - BigInt(1); // 2^y - 1 eg 2^8 - 1 = 255, 2^11 - 1 = 2047
    for (let i = 0; i < n; i++) {
      values[i] = BigInt(Math.floor(rand.next() * Number(maxValue)));
    }
    return values;
  }

  public JoinAndPadGeneratedValues(
    values: bigint[],
    expectedLength?: number,
    radix?: number
  ): string {
    const defaultRadix = radix ?? 16;
    const hexValues = values
      .map((value) =>
        value.toString(defaultRadix).padStart(defaultRadix == 2 ? 8 : 2, '0')
      )
      .join('');
    if (expectedLength) {
      return hexValues.padStart(expectedLength, '0');
    }
    return hexValues;
  }

  public GenerateMnemonicString(
    wordCount = 24,
    wordlist: string[]
  ): { phrase: string; checkWord: string } {
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsPerWord = Math.ceil(Math.log2(dictionarySize));
    const totalBits = wordCount * bitsPerWord;
    // round up to the nearest multiple of 8 (byte)
    const totalBytes = Math.ceil(totalBits / 8);
    const groupValues = this.GenerateNValuesOfYBits(wordCount, bitsPerWord);
    const paddedValues = this.JoinAndPadGeneratedValues(
      groupValues,
      totalBytes * 2,
      16
    );
    const words: string[] = new Array<string>(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const chunkBits = paddedValues.substring(
        (i * bitsPerWord) / 4,
        ((i + 1) * bitsPerWord) / 4
      );
      const wordIndex = parseInt(chunkBits, 16) % dictionarySize;
      words[i] = wordlist[wordIndex];
    }
    return {
      phrase: words.join(' '),
      checkWord: this.GenerateCheckWord(words.join(' '), wordlist),
    };
  }

  public ValidateMnemonicString(phrase: string, wordlist: string[]): boolean {
    // split input words
    const words = phrase.split(' ');
    // set aside the check word
    const actualCheckWord = words.pop();
    // re-generate the check word
    const expectedCheckWordInfo = this.GenerateMnemonicString(
      words.length,
      wordlist
    );
    return actualCheckWord === expectedCheckWordInfo.checkWord;
  }

  public MnemonicStringToSeed(phrase: string, wordlist: string[]): Buffer {
    const words = phrase.split(' ');
    const wordCount = words.length;
    const wordValues = this.PhraseToValues(phrase, wordlist);
    const paddedValues = this.JoinAndPadGeneratedValues(
      wordValues,
      wordCount * 2,
      16
    );
    return Buffer.from(paddedValues, 'hex');
  }

  public SeedToMnemonicString(
    seed: Buffer,
    wordlist: string[],
    wordCount = 24
  ): string {
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsPerWord = Math.ceil(Math.log2(dictionarySize));
    const totalBits = wordCount * bitsPerWord;
    // round up to the nearest multiple of 8 (byte)
    const totalBytes = Math.ceil(totalBits / 8);
    const groupValues = this.GenerateNValuesOfYBits(wordCount, bitsPerWord, seed.toString('hex'));
    const paddedValues = this.JoinAndPadGeneratedValues(
      groupValues,
      totalBytes * 2,
      16
    );
    const words: string[] = new Array<string>(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const chunkBits = paddedValues.substring(
        (i * bitsPerWord) / 4,
        ((i + 1) * bitsPerWord) / 4
      );
      const wordIndex = parseInt(chunkBits, 16) % dictionarySize;
      words[i] = wordlist[wordIndex];
    }
    return words.join(' ');
  }
}
