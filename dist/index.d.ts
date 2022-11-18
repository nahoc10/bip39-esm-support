declare const wordlists: {
    [index: string]: string[];
};

declare function mnemonicToSeedSync(mnemonic: string, password?: string): Buffer;
declare function mnemonicToSeed(mnemonic: string, password?: string): Promise<Buffer>;
declare function mnemonicToEntropy(mnemonic: string, wordlist?: string[]): string;
declare function entropyToMnemonic(entropy: Buffer | string, wordlist?: string[]): string;
declare function generateMnemonic(strength?: number, rng?: (size: number) => Buffer, wordlist?: string[]): string;
declare function validateMnemonic(mnemonic: string, wordlist?: string[]): boolean;
declare function setDefaultWordlist(language: string): void;
declare function getDefaultWordlist(): string;

export { entropyToMnemonic, generateMnemonic, getDefaultWordlist, mnemonicToEntropy, mnemonicToSeed, mnemonicToSeedSync, setDefaultWordlist, validateMnemonic, wordlists };
