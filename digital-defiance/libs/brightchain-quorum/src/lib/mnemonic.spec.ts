import Mnemonic from './mnemonic';
import { wordlists } from 'bip39';

const wordList: string[] = wordlists['english'];

describe('mnemonic', () => {
  it('should generate a mnemonic', () => {
    const wordCount = 24;
    const mnemonic = Mnemonic.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // validate actual check string
    const isValid = Mnemonic.ValidateMnemonicString(
      [mnemonic.phrase, mnemonic.checkWord].join(' '),
      wordList
    );
    expect(isValid).toBeTruthy();
  });

  it('should detect an invalid check word', () => {
    const wordCount = 24;
    const mnemonic = Mnemonic.GenerateMnemonicString(wordCount, wordList);
    expect(mnemonic).toBeTruthy();
    expect(mnemonic.words.length).toEqual(wordCount);

    // pick a word from the dictionary that isn't the check word
    const invalidCheckWord = wordList.find(
      (word) => word !== mnemonic.checkWord
    );
    expect(invalidCheckWord).toBeTruthy();

    // validate
    const isValid = Mnemonic.ValidateMnemonicString(
      [mnemonic.words, invalidCheckWord].join(' '),
      wordList
    );
    expect(isValid).toBeFalsy();
  });
});
