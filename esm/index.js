import * as createHash from 'create-hash';
import { pbkdf2Sync, pbkdf2 } from 'pbkdf2';
import * as randomBytes from 'randombytes';
import { wordlists, _default } from './_wordlists.js';
export { wordlists } from './_wordlists.js';

let DEFAULT_WORDLIST = _default;
const INVALID_MNEMONIC = "Invalid mnemonic";
const INVALID_ENTROPY = "Invalid entropy";
const INVALID_CHECKSUM = "Invalid mnemonic checksum";
const WORDLIST_REQUIRED = "A wordlist is required but a default could not be found.\nPlease pass a 2048 word array explicitly.";
function pbkdf2Promise(password, saltMixin, iterations, keylen, digest) {
  return Promise.resolve().then(
    () => new Promise(
      (resolve, reject) => {
        const callback = (err, derivedKey) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(derivedKey);
          }
        };
        pbkdf2(password, saltMixin, iterations, keylen, digest, callback);
      }
    )
  );
}
function normalize(str) {
  return (str || "").normalize("NFKD");
}
function lpad(str, padString, length) {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}
function binaryToByte(bin) {
  return parseInt(bin, 2);
}
function bytesToBinary(bytes) {
  return bytes.map((x) => lpad(x.toString(2), "0", 8)).join("");
}
function deriveChecksumBits(entropyBuffer) {
  const ENT = entropyBuffer.length * 8;
  const CS = ENT / 32;
  const hash = createHash("sha256").update(entropyBuffer).digest();
  return bytesToBinary(Array.from(hash)).slice(0, CS);
}
function salt(password) {
  return "mnemonic" + (password || "");
}
function mnemonicToSeedSync(mnemonic, password) {
  const mnemonicBuffer = Buffer.from(normalize(mnemonic), "utf8");
  const saltBuffer = Buffer.from(salt(normalize(password)), "utf8");
  return pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, "sha512");
}
function mnemonicToSeed(mnemonic, password) {
  return Promise.resolve().then(
    () => {
      const mnemonicBuffer = Buffer.from(normalize(mnemonic), "utf8");
      const saltBuffer = Buffer.from(salt(normalize(password)), "utf8");
      return pbkdf2Promise(mnemonicBuffer, saltBuffer, 2048, 64, "sha512");
    }
  );
}
function mnemonicToEntropy(mnemonic, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST;
  if (!wordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }
  const words = normalize(mnemonic).split(" ");
  if (words.length % 3 !== 0) {
    throw new Error(INVALID_MNEMONIC);
  }
  const bits = words.map(
    (word) => {
      const index = wordlist.indexOf(word);
      if (index === -1) {
        throw new Error(INVALID_MNEMONIC);
      }
      return lpad(index.toString(2), "0", 11);
    }
  ).join("");
  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);
  const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
  if (entropyBytes.length < 16) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length > 32) {
    throw new Error(INVALID_ENTROPY);
  }
  if (entropyBytes.length % 4 !== 0) {
    throw new Error(INVALID_ENTROPY);
  }
  const entropy = Buffer.from(entropyBytes);
  const newChecksum = deriveChecksumBits(entropy);
  if (newChecksum !== checksumBits) {
    throw new Error(INVALID_CHECKSUM);
  }
  return entropy.toString("hex");
}
function entropyToMnemonic(entropy, wordlist) {
  if (!Buffer.isBuffer(entropy)) {
    entropy = Buffer.from(entropy, "hex");
  }
  wordlist = wordlist || DEFAULT_WORDLIST;
  if (!wordlist) {
    throw new Error(WORDLIST_REQUIRED);
  }
  if (entropy.length < 16) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (entropy.length > 32) {
    throw new TypeError(INVALID_ENTROPY);
  }
  if (entropy.length % 4 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }
  const entropyBits = bytesToBinary(Array.from(entropy));
  const checksumBits = deriveChecksumBits(entropy);
  const bits = entropyBits + checksumBits;
  const chunks = bits.match(/(.{1,11})/g);
  const words = chunks.map(
    (binary) => {
      const index = binaryToByte(binary);
      return wordlist[index];
    }
  );
  return wordlist[0] === "\u3042\u3044\u3053\u304F\u3057\u3093" ? words.join("\u3000") : words.join(" ");
}
function generateMnemonic(strength, rng, wordlist) {
  strength = strength || 128;
  if (strength % 32 !== 0) {
    throw new TypeError(INVALID_ENTROPY);
  }
  rng = rng || randomBytes;
  return entropyToMnemonic(rng(strength / 8), wordlist);
}
function validateMnemonic(mnemonic, wordlist) {
  try {
    mnemonicToEntropy(mnemonic, wordlist);
  } catch (e) {
    return false;
  }
  return true;
}
function setDefaultWordlist(language) {
  const result = wordlists[language];
  if (result) {
    DEFAULT_WORDLIST = result;
  } else {
    throw new Error('Could not find wordlist for language "' + language + '"');
  }
}
function getDefaultWordlist() {
  if (!DEFAULT_WORDLIST) {
    throw new Error("No Default Wordlist set");
  }
  return Object.keys(wordlists).filter(
    (lang) => {
      if (lang === "JA" || lang === "EN") {
        return false;
      }
      return wordlists[lang].every(
        (word, index) => word === DEFAULT_WORDLIST[index]
      );
    }
  )[0];
}

export { entropyToMnemonic, generateMnemonic, getDefaultWordlist, mnemonicToEntropy, mnemonicToSeed, mnemonicToSeedSync, setDefaultWordlist, validateMnemonic };
