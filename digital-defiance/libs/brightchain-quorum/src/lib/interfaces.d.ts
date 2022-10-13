export interface IShamirShareDetail {
  bits: number;
  id: number;
  data: string;
}

export interface IMnemonic {
  static GenerateCheckWord(phrase: string, wordlist: string[]): string;

  static GenerateMnemonicString(
    wordCount = 24,
    wordlist: string[]
  ): { phrase: string; checkWord: string };

  static ValidateMnemonicString(phrase: string, wordlist: string[]): boolean;

  static MnemonicStringToSeed(phrase: string, wordlist: string[]): Buffer;

  static SeedToMnemonicString(
    seed: Buffer,
    wordlist: string[],
    wordCount = 24
  ): string;
}
