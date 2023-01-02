import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  gMaxLength,
  maybeNdef,
  PlutusData,
  randomChoice,
  toPlutusData,
} from "../../mod.ts";
import { Data } from "../data.ts";
import { PConstraint } from "./constraint.ts";
import { PList } from "./list.ts";
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
    public pkey: PKey,
    public pvalue: PValue,
    public size?: number,
    public keys?: PLifted<PKey>[],
  ) {
    if (keys) {
      if (size) {
        assert(keys.length === size, `PMap: wrong size`);
      } else {
        this.size = keys.length;
      }
    }
  }

  public plift = (
    m: Map<PConstanted<PKey>, PConstanted<PValue>>,
  ): Map<PLifted<PKey>, PLifted<PValue>> => {
    assert(m instanceof Map, `plift: expected Map`);
    assert(
      !this.size || this.size === m.size,
      `plift: wrong size`,
    );

    const p = new Map<PLifted<PKey>, PLifted<PValue>>();
    let i = 0;
    m.forEach((value: PLifted<PKey>, key: PLifted<PValue>) => {
      const k = this.pkey.plift(key);
      assert(!this.keys || this.keys[i++] === k, `plift: wrong key`);
      p.set(k, this.pvalue.plift(value));
    });
    return p;
  };

  public pconstant = (
    data: Map<PLifted<PKey>, PLifted<PKey>>,
  ): Map<PConstanted<PKey>, PConstanted<PValue>> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(
      !this.size || this.size === data.size,
      `pconstant: wrong size: ${this.size} vs. ${data.size}`,
    );

    const m = new Map<PConstanted<PKey>, PConstanted<PValue>>();
    let i = 0;
    data.forEach((value, key) => {
      assert(!this.keys || this.keys[i++] === key, `pconstant: wrong key`);
      m.set(
        this.pkey.pconstant(key) as PConstanted<PKey>,
        this.pvalue.pconstant(value) as PConstanted<PValue>,
      );
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
    const keys = maybeNdef(() => PMap.genKeys(pkey))?.();
    const size = maybeNdef(keys?.length ?? genNonNegative(maxLength));

    return new PMap(pkey, pvalue, size, keys);
  }

  static genKeys<PKey extends PData>(
    pkey: PKey,
    size = genNonNegative(gMaxLength),
  ): PLifted<PKey>[] {
    const keys = new Array<PLifted<PKey>>();
    const keyStrings = new Array<string>();
    let timeout = 10;
    while (keys.length < size) {
      const key = pkey.genData();
      const keyString = Data.to(toPlutusData(key));
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        keys.push(key);
      } else if (timeout-- < 0) {
        throw new Error(
          `timeout: ${JSON.stringify(keyStrings)}\nkey: ${
            JSON.stringify(pkey)
          }`,
        );
      }
    }
    return keys;
  }

  static genMap<PKey extends PData, PValue extends PData>(
    pkey: PKey,
    pvalue: PValue,
    size: number,
  ): Map<PLifted<PKey>, PConstanted<PValue>> {
    const m = new Map<PLifted<PKey>, PLifted<PValue>>();
    const keys = PMap.genKeys(pkey, size);
    keys.forEach((key: PLifted<PKey>) => {
      m.set(key, pvalue.genData());
    });
    return m;
  }

  public genData = (): Map<PLifted<PKey>, PConstanted<PValue>> => {
    if (this.keys) {
      const m = new Map<PLifted<PKey>, PConstanted<PValue>>();
      this.keys.forEach((key: PLifted<PKey>) => {
        m.set(key, this.pvalue.genData());
      });
      return m;
    } else {
      const size = this.size ? this.size : genNonNegative(gMaxLength);
      return PMap.genMap(this.pkey, this.pvalue, size);
    }
  };
}
