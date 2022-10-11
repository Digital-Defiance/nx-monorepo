import ShamirsMnemonic from './shamirs-mnemonic';
import { wordlists } from 'bip39';

describe("shamir's mnemonic", () => {
  it('should generate a seed phrase', () => {
    const wordCount = 24;
    const mnemonic = new ShamirsMnemonic(wordlists['english'], wordCount);
  });
});
