import { randomBytes } from 'crypto';
/**
 * Class to facilitate the generation of a mnemonic phrase and the conversion of a mnemonic phrase to a seed.
 * The mnemonic has a checksum builtin.
 * This is a non-standard approach.  The standard approach is to use the bip39 library directly. We are only
 * using the wordlists from that library.
 */
export default abstract class Mnemonic {
  public static GenerateCheckWord(
    phrase: string[],
    wordlist: string[]
  ): string {
    const wordCount = phrase.length;
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsRequired = Math.ceil(Math.log2(dictionarySize));
    // create an array of the bit groupings
    const bitGroups: string[] = new Array<string>(wordCount);
    const groupValues: number[] = new Array(wordCount);

    // add every other value
    // xor every value
    const addBase = 0n;
    const xorBase = 0n;

    for (let i = 0; i < wordCount; i++) {
      // locate the word in the wordlist
      const wordIndex = wordlist.indexOf(phrase[i]);
      if (wordIndex < 0) {
        throw new Error(`Word not found in wordlist: ${phrase[i]}`);
      }
      const wordBits = wordIndex.toString(2).padStart(bitsRequired, '0');
      bitGroups[i] = wordBits;
      groupValues[i] = Number('0b' + wordBits);

      if (i % 2 === 0) {
        addBase + BigInt(groupValues[i]);
      }
      xorBase ^ BigInt(groupValues[i]);
    }

    // now that we have a list of candidates, take the index modulo the number of candidates
    const checkWordIndex = Number(addBase % BigInt(dictionarySize) ^ xorBase);
    const checkWord = wordlist[checkWordIndex];
    return checkWord;
  }

  public static GenerateMnemonicString(
    wordCount = 24,
    wordlist: string[]
  ): { words: string[]; phrase: string; checkWord: string } {
    // assumes a filtered dictionary with no duplicates, whitespace, etc.
    const dictionarySize = wordlist.length;
    // number of bits needed to represent the highest index in the dictionary
    const bitsRequired = Math.ceil(Math.log2(dictionarySize));
    const totalBits = wordCount * bitsRequired;
    // round up to the nearest multiple of 8 (byte)
    const totalBytes = Math.ceil(totalBits / 8);
    // generate random bytes
    const bytesFromRandom = randomBytes(totalBytes);
    // convert bytes to bits
    const randomBits = Array.from(bytesFromRandom)
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');
    // create an array of the bit groupings
    const bitGroups: string[] = new Array<string>(wordCount);
    const groupValues: number[] = new Array(wordCount);
    for (let i = 0; i < wordCount; i++) {
      const start = i * bitsRequired;
      const end = start + bitsRequired;
      bitGroups[i] = randomBits.substring(start, end);
      groupValues[i] = Number('0b' + bitGroups[i]);
    }
    // map the bit groupings to the dictionary
    const words = groupValues.map((value) => wordlist[value]);
    return {
      words: words,
      phrase: words.join(' '),
      checkWord: Mnemonic.GenerateCheckWord(words, wordlist),
    };
  }

  public static ValidateMnemonicString(
    phrase: string,
    wordlist: string[]
  ): boolean {
    // split input words
    const words = phrase.split(' ');
    // set aside the check word
    const actualCheckWord = words.pop();
    // re-generate the check word
    const expectedCheckWordInfo = Mnemonic.GenerateMnemonicString(
      words.length,
      wordlist
    );
    return actualCheckWord === expectedCheckWordInfo.checkWord;
  }
}
