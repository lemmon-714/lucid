import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  gMaxLength,
  maybeNdef,
  PlutusData,
  toPlutusData,
} from "../../mod.ts";
import { Data } from "../data.ts";
import { PConstraint } from "./constraint.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PMap<
  PKey extends PData,
  PValue extends PData,
> implements
  PType<
    Map<PConstanted<PKey>, PConstanted<PValue>>,
    Map<PLifted<PKey>, PLifted<PValue>>
  > {
  constructor(
    public pkey: PType<PConstanted<PKey>, PLifted<PKey>>,
    public pvalue: PType<PConstanted<PValue>, PLifted<PValue>>,
    public size?: number,
  ) {}

  public plift = (
    m: Map<PConstanted<PKey>, PConstanted<PValue>>,
  ): Map<PLifted<PKey>, PLifted<PValue>> => {
    assert(m instanceof Map, `plift: expected Map`);
    assert(
      !this.size || this.size === m.size,
      `plift: wrong size: ${JSON.stringify(this)} vs. ${JSON.stringify(m)}`,
    );
    const p = new Map<PLifted<PKey>, PLifted<PValue>>();
    m.forEach((value: PLifted<PKey>, key: PLifted<PValue>) => {
      p.set(this.pkey.plift(key), this.pvalue.plift(value));
    });
    return p;
  };

  public pconstant = (
    data: Map<PLifted<PKey>, PLifted<PKey>>,
  ): Map<PConstanted<PKey>, PConstanted<PValue>> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(!this.size || this.size === data.size, `pconstant: wrong size`);
    const m = new Map<PConstanted<PKey>, PConstanted<PValue>>();
    data.forEach((value, key) => {
      m.set(this.pkey.pconstant(key), this.pvalue.pconstant(value));
    });
    return m;
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PMap<PData, PData> {
    const pkey = gen.generate(maxDepth - 1, maxLength);
    const pvalue = gen.generate(maxDepth - 1, maxLength);
    const size = maybeNdef(genNonNegative(maxLength));

    return new PMap(pkey, pvalue, size);
  }

  static genMap<PKey extends PData, PValue extends PData>(
    pkey: PKey,
    pvalue: PValue,
    size: number,
  ): Map<PLifted<PKey>, PConstanted<PValue>> {
    const m = new Map<PLifted<PKey>, PLifted<PValue>>();
    const keyStrings = new Array<string>();
    let timeout = 10;
    while (m.size < size) {
      const key = pkey.genData();
      const keyString = Data.to(toPlutusData(key));
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        const value = pvalue.genData();
        m.set(key, value);
      } else if (timeout-- < 0) {
        throw new Error(
          `timeout: ${JSON.stringify(keyStrings)}\nkey: ${
            JSON.stringify(pkey)
          }`,
        );
      }
    }
    return m;
  }

  public genData = (): Map<PLifted<PKey>, PConstanted<PValue>> => {
    const size = this.size ? this.size : genNonNegative(gMaxLength);
    return PMap.genMap(this.pkey, this.pvalue, size);
  };

  // static genPlutusMap<PKey extends PData, PValue extends PData>(
  //   pkey: PKey,
  //   pvalue: PValue,
  //   size: number,
  // ): Map<PConstanted<PKey>, PConstanted<PValue>> {
  //   const m = new Map<PConstanted<PKey>, PConstanted<PValue>>();
  //   const keyStrings = new Array<string>();
  //   let timeout = 10;
  //   while (m.size < size) {
  //     const key = pkey.genPlutusData() as PConstanted<PKey>;
  //     const keyString = Data.to(key);
  //     if (!keyStrings.includes(keyString)) {
  //       keyStrings.push(keyString);
  //       const value = pvalue.genPlutusData() as PConstanted<PValue>;
  //       m.set(key, value);
  //     } else if (timeout-- < 0) {
  //       throw new Error(
  //         `timeout: ${JSON.stringify(keyStrings)}\nkey: ${
  //           JSON.stringify(pkey)
  //         }`,
  //       );
  //     }
  //   }
  //   return m;
  // }

  // public genPlutusData(): Map<PConstanted<PKey>, PConstanted<PValue>> {
  //   const size = this.size ? this.size : genNonNegative(gMaxLength);
  //   return PMap.genPlutusMap(this.pkey, this.pvalue, size);
  // }
}
