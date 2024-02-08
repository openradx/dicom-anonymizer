// import * as crypto from "crypto";
import getRandomValues from "get-random-values";

// use only in node env

export class Randomizer {
  private seed: string;

  constructor(seed = "") {
    if (seed == "") {
      this.seed = this.generateRandomSeed();
    } else {
      this.seed = seed;
    }
  }

  
  // For Node work
  // private calculateMD5Digest(data: Uint8Array): Uint8Array {
  //   const hash = crypto.createHash("md5");
  //   hash.update(data);
  //   return hash.digest();
  // }

  private async calculateSHADigestWeb(array: Uint8Array): Promise<Uint8Array> {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", array);
    return new Uint8Array(hashBuffer);
  }

  private calculateResult(hash: Uint8Array): bigint {
    let result = 0;
    for (const byte of hash) {
      result *= 0x100;
      result += byte;
    }
    return BigInt(result);
  }

  private generateRandomSeed(): string {
    const randomValues = new Uint8Array(20);
    getRandomValues(randomValues);
    // window.crypto.getRandomValues(randomValues); -> use in browser env
    const seed = Array.from(randomValues, (byte) => byte.toString(16).padStart(2, "0")).join("");

    return seed;
  }

  public toInt(originalValue: string, callback: (result: bigint) => void): void {
    const message = this.seed + String(originalValue);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    if (typeof window !== "undefined") {
      this.calculateSHADigestWeb(encoded).then((hashBuffer) => {
        const hashed = hashBuffer;
        const result = this.calculateResult(hashed);
        callback(result);
      });
    } else {
      // const hashed = this.calculateMD5Digest(encoded);
      // const result = this.calculateResult(hashed);
      // callback(result);
    }
  }

  public getIntsFromRanges(originalValue: string, ...suprema: number[]): number[] {
    let result: bigint | number[] = [];
    this.toInt(originalValue, (res) => {
      let bigNumber = res;
      const arr: number[] = [];
      for (const x of suprema) {
        const s = BigInt(x);
        arr.push(Number(bigNumber % s));
        bigNumber = bigNumber / s;
      }

      result = arr;
    });
    return result;
  }
}
