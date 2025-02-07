class Randomizer {
  private seed: string;

  constructor(seed?: string) {
    this.seed = seed || this.generateRandomSeed();
  }

  private async calculateSHADigestWeb(array: Uint8Array): Promise<Uint8Array> {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", array);
    return new Promise((resolve) => {
      resolve(new Uint8Array(hashBuffer));
    });
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
    window.crypto.getRandomValues(randomValues); //-> use in browser env
    const seed = Array.from(randomValues, (byte) => byte.toString(16).padStart(2, "0")).join("");

    return seed;
  }

  public async toInt(originalValue: string): Promise<bigint> {
    const message = this.seed + String(originalValue);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);
    const hashed = await this.calculateSHADigestWeb(encoded);
    const result = this.calculateResult(hashed);

    return result;
  }
  public async getIntsFromRanges(originalValue: string, ...suprema: number[]): Promise<number[]> {
    let result: bigint | number[] = [];
    let bigNumber = await this.toInt(originalValue);
    const arr: number[] = [];
    for (const x of suprema) {
      const s = BigInt(x);
      arr.push(Number(bigNumber % s));
      bigNumber = bigNumber / s;
    }
    result = arr;
    return result;
  }
}

export default Randomizer;
