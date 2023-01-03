// TODO consider generating wrong cases as well

import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  PByteString,
  PData,
  PInteger,
  PlutusData,
  PRecord,
  PType,
} from "../mod.ts";

const zeroChance = 0.1;
const ndefChance = 0.1;
export const maxInteger = BigInt(Number.MAX_SAFE_INTEGER); // TODO better value, maybe look at chain/plutus max
const maxStringBytes = 100n; // TODO higher
export const gMaxLength = 4n;
export const gMaxDepth = 2n;

export function max(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

export function randomChoice<T>(alternatives: T[]): T {
  return randomIndexedChoice(alternatives)[0];
}

export function randomIndexedChoice<T>(alternatives: T[]): [T, number] {
  const choice = Math.floor(Math.random() * alternatives.length);
  return [alternatives[choice], choice];
}

export function toPlutusData(data: any): PlutusData {
  if (data instanceof Array) {
    return data.map(toPlutusData);
  } else if (data instanceof Map) {
    const m = new Map<PlutusData, PlutusData>();
    data.forEach(
      (value: any, key: any) => {
        m.set(toPlutusData(key), toPlutusData(value));
      },
    );
    return m;
  } else if (data instanceof Object) {
    return toPlutusData(Object.values(data));
  } else {
    return data;
  }
}

export function maybeNdef<T>(value: T) {
  if (Math.random() > ndefChance) {
    return value;
  } else {
    return undefined;
  }
}

export function genPositive(maxValue?: bigint): bigint {
  assert(maxValue === undefined || maxValue > 0n, `genPositive: maxValue <= 0`);
  return 1n +
    BigInt(
      Math.floor(Math.random() * Number(maxValue ? maxValue - 1n : maxInteger)),
    );
}

export function genNonNegative(maxValue?: bigint): bigint {
  if (Math.random() > zeroChance) {
    return genPositive(maxValue);
  } else {
    return 0n;
  }
}

export function genNumber(maxValue?: bigint): bigint {
  const n = genNonNegative(maxValue);
  return randomChoice([n, -n]);
}

export function genString(alph: string): string {
  function genChar(): string {
    const choice = Math.floor(Math.random() * (alph.length + 10));
    if (choice < alph.length) {
      return alph.charAt(choice);
    } else {
      return Math.floor(Math.random() * 10).toString();
    }
  }
  const l: string[] = [];
  const maxi = 8n * genNonNegative(maxStringBytes);
  for (let i = 0; i < maxi; i++) {
    l.push(genChar());
  }
  const s = l.join("");
  return s;
}

export function genName(): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = lower.toUpperCase();
  const alph = lower + upper; // TODO special characters
  return genString(alph);
}

export class Generators {
  constructor(
    public primitives: Array<
      () => PData
    >,
    public containers: Array<
      (
        gen: Generators,
        maxDepth: bigint,
        maxLength: bigint,
      ) => PData
    >,
  ) {}

  public generate(maxDepth: bigint, maxLength: bigint): PData {
    const generator = maxDepth > 0
      ? randomChoice([
        ...this.primitives,
        ...this.containers,
      ])
      : randomChoice(this.primitives);
    // console.log(maxDepth, maxLength);
    return generator(this, max(maxDepth - 1n, 0n), maxLength);
  }
}

// sample named record

export class Example {
  constructor(
    public ccy: string,
    public tkn: string,
    public amnt: bigint,
  ) {}
}

export function genPExample() {
  return new PRecord<PByteString | PInteger>(
    {
      "ccy": new PByteString(),
      "tkn": new PByteString(),
      "amnt": new PInteger(),
    },
    //@ts-ignore TODO fixme
    Example,
  );
}
