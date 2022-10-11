import Mnemonic from './mnemonic';
import { wordlists } from 'bip39';

const wordList: string[] = wordlists['english'];

describe('mnemonic', () => {
  it('should generate a mnemonic', () => {
    const wordCount = 24;
    const mnemonicInstance  = new Mnemonic();
    const mnemonic = mnemonicInstance.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // validate actual check string
    const isValid = mnemonicInstance.ValidateMnemonicString(
      [mnemonic.phrase, mnemonic.checkWord].join(' '),
      wordList
    );
    expect(isValid).toBeTruthy();
  });

  it('should detect an invalid check word', () => {
    const wordCount = 24;
    const mnemonicInstance  = new Mnemonic();
    const mnemonic = mnemonicInstance.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // pick a word from the dictionary that isn't the check word
    const invalidCheckWord = wordList.find(
      (word) => word !== mnemonic.checkWord
    );
    expect(invalidCheckWord).toBeTruthy();

    // validate
    const isValid = mnemonicInstance.ValidateMnemonicString(
      [mnemonic.words, invalidCheckWord].join(' '),
      wordList
    );
    expect(isValid).toBeFalsy();
  });

  it('should convert a mnemonic to a seed and back', () => {
    const wordCount = 24;
    const mnemonicInstance  = new Mnemonic();
    const mnemonic = mnemonicInstance.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // convert to seed
    const seed = mnemonicInstance.MnemonicStringToSeed(mnemonic.words, wordList);
    expect(seed).toBeTruthy();

    // convert to seed again repreatably
    const seed2 = mnemonicInstance.MnemonicStringToSeed(mnemonic.words, wordList);
    expect(seed2).toBeTruthy();
    expect(seed2.toString('hex')).toEqual(seed.toString('hex'));

    // convert back to mnemonic reliably
    const mnemonic2 = mnemonicInstance.SeedToMnemonicString(seed, wordList);
    expect(mnemonic2).toBeTruthy();
    expect(mnemonic2).toEqual(wordCount);
    expect(mnemonic2).toEqual(mnemonic.words);
  });

  it('should convert a mnemonic to a seed and back', () => {
    const wordCount = 24;
    const mnemonicInstance  = new Mnemonic();
    const mnemonic = mnemonicInstance.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // convert to seed
    const seed = mnemonicInstance.MnemonicStringToSeed(mnemonic.words, wordList);
    expect(seed).toBeTruthy();

    // convert back
    const mnemonic2 = mnemonicInstance.SeedToMnemonicString(seed, wordList);
    expect(mnemonic2).toBeTruthy();
    expect(mnemonic2.length).toEqual(wordCount);
    expect(mnemonic2).toEqual(mnemonic.words);
  });
});
