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
  K extends PData,
  V extends PData,
> implements
  PType<Map<PConstanted<K>, PConstanted<V>>, Map<PLifted<K>, PLifted<V>>> {
  constructor(
    public pkey: PType<PConstanted<K>, PLifted<K>>,
    public pvalue: PType<PConstanted<V>, PLifted<V>>,
    public size?: number,
  ) {}

  public plift = (
    m: Map<PConstanted<K>, PConstanted<V>>,
  ): Map<PLifted<K>, PLifted<V>> => {
    assert(m instanceof Map, `plift: expected Map`);
    assert(
      !this.size || this.size === m.size,
      `plift: wrong size: ${JSON.stringify(this)} vs. ${JSON.stringify(m)}`,
    );
    const p = new Map<PLifted<K>, PLifted<V>>();
    m.forEach((value: PLifted<K>, key: PLifted<V>) => {
      p.set(this.pkey.plift(key), this.pvalue.plift(value));
    });
    return p;
  };

  public pconstant = (
    data: Map<PLifted<K>, PLifted<K>>,
  ): Map<PConstanted<K>, PConstanted<V>> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(!this.size || this.size === data.size, `pconstant: wrong size`);
    const m = new Map<PConstanted<K>, PConstanted<V>>();
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

  static genMap<K extends PData, V extends PData>(
    pkey: K,
    pvalue: V,
    size: number,
  ): Map<PLifted<K>, PConstanted<V>> {
    const m = new Map<PLifted<K>, PLifted<V>>();
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

  public genData = (): Map<PLifted<K>, PConstanted<V>> => {
    const size = this.size ? this.size : genNonNegative(gMaxLength);
    return PMap.genMap(this.pkey, this.pvalue, size);
  };

  static genPlutusMap<K extends PData, V extends PData>(
    pkey: K,
    pvalue: V,
    size: number,
  ): Map<PConstanted<K>, PConstanted<V>> {
    const m = new Map<PConstanted<K>, PConstanted<V>>();
    const keyStrings = new Array<string>();
    let timeout = 10;
    while (m.size < size) {
      const key = pkey.genPlutusData() as PConstanted<K>;
      const keyString = Data.to(key);
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        const value = pvalue.genPlutusData() as PConstanted<V>;
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

  public genPlutusData(): Map<PConstanted<K>, PConstanted<V>> {
    const size = this.size ? this.size : genNonNegative(gMaxLength);
    return PMap.genPlutusMap(this.pkey, this.pvalue, size);
  }
}
