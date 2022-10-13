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
    // generate random bytes
    const bytesFromRandom = randomBytes(totalBytes);
    // convert bytes to bits string ie 1010101110
    const randomBits = Array.from(bytesFromRandom)
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');
    // trim randomBits back down if needed
    const trimmedRandomBits = randomBits.slice(0, totalBits);

    // create an array of the bit groupings
    const bitGroups: string[] = new Array<string>(wordCount);
    const groupValues: number[] = new Array(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const start = i * bitsPerWord;
      const end = start + bitsPerWord;
      bitGroups[i] = trimmedRandomBits.substring(start, end);
      groupValues[i] = Number('0b' + bitGroups[i]);
    }
    // map the bit groupings to the dictionary
    const words = groupValues.map((value) => wordlist[value]);
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
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsPerWord = Math.ceil(Math.log2(dictionarySize));

    const bitGroups: string[] = new Array<string>(wordCount);
    const groupValues: bigint[] = new Array(wordCount);
    const groupHexValues: string[] = new Array(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const wordBits = wordValues[i].toString(2).padStart(bitsPerWord, '0');
      bitGroups[i] = wordBits;
      groupValues[i] = BigInt('0b' + wordBits);
      groupHexValues[i] = groupValues[i].toString(16).padStart(2, '0');
    }
    return Buffer.from(groupHexValues.join(''), 'hex');
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
    const totalBytes = Math.ceil(totalBits / 8);

    const binarySeed = new Uint8Array(totalBytes);
    for (let i = 0; i < seed.length; i++) {
      binarySeed[i] = seed[i];
    }
    const seedBits = Array.from(binarySeed)
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    const phrase: string[] = new Array<string>(wordCount);
    // break the seed into groups of bitsRequired (11 for 2048)
    for (let i = 0; i < wordCount; i++) {
      const start = i * bitsPerWord;
      const end = start + bitsPerWord;
      const chunkBits = seedBits.substring(start, end);
      const wordIndex = Number('0b' + chunkBits);
      const word = wordlist[wordIndex];
      phrase[i] = word;
    }
    return phrase.join(' ');
  }
}
