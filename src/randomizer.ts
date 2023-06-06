import * as crypto from "crypto";
import getRandomValues from 'get-random-values'; 

export class Randomizer {
  private seed: string;

  constructor(seed?: string | undefined ) {
    if (seed != null || seed === undefined) {
      this.seed = this.generateRandomSeed();
    } else {
      this.seed = seed;
    }
  }

/* for Browserenvironment
  private generateRandomBytes(length: number): Uint8Array {
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    return randomValues;
  }
  */
  
  
  private calculateMD5Digest(data: Uint8Array): Uint8Array {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest();
  }
  
  
  private calculateResult(hash: Uint8Array): bigint {
    let result = 0;
    for (const byte of hash) {
      result *= 0x100;
      result += byte;
      
    }
    let res = BigInt(result);
    console.log(res);
    return res;
  }


  private generateRandomSeed(): string {
    const randomValues = new Uint8Array(20);
    getRandomValues(randomValues);
    const seed = Array.from(randomValues, (byte) => byte.toString(16).padStart(2, '0')).join('');
    
    return seed
  }

  public toInt(originalValue: any): bigint {
    const message = this.seed + String(originalValue);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);  
    const hashed = this.calculateMD5Digest(encoded);
    let result = this.calculateResult(hashed);
       
    return result;
  }

  
  public getIntsFromRanges(originalValue: any, ...suprema: number[]): number[] {
    let big_Int = this.toInt(originalValue);
    const result: number[] = [];
    for (let x of suprema) {
      let s = BigInt(x)
      result.push(Number(big_Int % s));
      // console.log(s, big_Int, big_Int%s);
      // console.log(BigInt(Math.floor(Number(big_Int / s))));
      big_Int = big_Int / s;
    }
    return result;
  }
}

