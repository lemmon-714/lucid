// TODO consider generating wrong cases as well

import { PlutusData } from "../mod.ts";
import { PByteString } from "../parse/pbytestring.ts";
import { PInteger } from "../parse/pinteger.ts";
import { PRecord } from "../parse/precord.ts";
import { PType } from "../parse/ptype.ts";

const zeroChance = 0.1;
const ndefChance = 0.1;
export const maxInteger = Number.MAX_SAFE_INTEGER;
const maxStringBytes = 100; // TODO higher
export const gMaxLength = 12;
export const gMaxDepth = 2;

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

export function genNumber(maxValue: number): number {
  if (Math.random() > zeroChance) {
    return Math.floor(Math.random() * maxValue);
  } else {
    return 0;
  }
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
  const maxi = 8 * genNumber(maxStringBytes);
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
      () => PType<PlutusData, any>
    >,
    public containers: Array<
      (
        gen: Generators,
        maxDepth: number,
        maxLength: number,
      ) => PType<PlutusData, any>
    >,
  ) {}

  public generate(maxDepth: number, maxLength: number): PType<PlutusData, any> {
    const generator = maxDepth > 0
      ? randomChoice([
        ...this.primitives,
        ...this.containers,
      ])
      : randomChoice(this.primitives);
    console.log(maxDepth, maxLength);
    return generator(this, Math.max(maxDepth - 1, 0), maxLength);
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
  return new PRecord<string | bigint, string | bigint>(
    {
      "ccy": new PByteString(),
      "tkn": new PByteString(),
      "amnt": new PInteger(),
    },
    //@ts-ignore TODO fixme
    Example,
  );
}
