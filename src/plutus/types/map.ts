import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  gMaxLength,
  maybeNdef,
  toPlutusData,
} from "../../mod.ts";
import { Data } from "../data.ts";
import { f, PConstanted, PData, PLifted, PType, t } from "./type.ts";

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
    public size?: bigint,
    public keys?: PLifted<PKey>[],
  ) {
    if (keys) {
      const length = BigInt(keys.length);
      if (size) {
        assert(length === size, `PMap: wrong size`);
      } else {
        this.size = length;
      }
    }
  }

  public plift = (
    m: Map<PConstanted<PKey>, PConstanted<PValue>>,
  ): Map<PLifted<PKey>, PLifted<PValue>> => {
    assert(m instanceof Map, `plift: expected Map`);
    assert(
      !this.size || this.size === BigInt(m.size),
      `plift: wrong size`,
    );

    const data = new Map<PLifted<PKey>, PLifted<PValue>>();
    let i = 0;
    m.forEach((value: PLifted<PKey>, key: PLifted<PValue>) => {
      const k = this.pkey.plift(key);
      assert(
        !this.keys ||
          Data.to(this.pkey.pconstant(this.keys[i++])) ===
            Data.to(this.pkey.pconstant(k)),
        `PMap.plift: wrong key`,
      );
      data.set(k, this.pvalue.plift(value));
    });
    return data;
  };

  public pconstant = (
    data: Map<PLifted<PKey>, PLifted<PKey>>,
  ): Map<PConstanted<PKey>, PConstanted<PValue>> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(
      !this.size || this.size === BigInt(data.size),
      `pconstant: wrong size: ${this.size} vs. ${data.size}`,
    );

    const m = new Map<PConstanted<PKey>, PConstanted<PValue>>();
    let i = 0;
    data.forEach((value, key) => {
      assert(!this.keys || this.keys[i++] === key, `PMap.pconstant: wrong key`);
      m.set(
        this.pkey.pconstant(key) as PConstanted<PKey>,
        this.pvalue.pconstant(value) as PConstanted<PValue>,
      );
    });
    return m;
  };

  static genKeys<PKey extends PData>(
    pkey: PKey,
    size?: bigint,
  ): PLifted<PKey>[] {
    function timeoutError(): never {
      throw new Error(
        `Map.genKeys: timeout
${t}keyStrings: ${JSON.stringify(keyStrings)},
${t}pkey: ${pkey.show(t)},
${t}size: ${Number(size)}`,
      );
    }

    function genKey(): void {
      const key = pkey.genData();
      const keyString = Data.to(toPlutusData(key));
      let timeout = gMaxLength + 100n;
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        keys.push(key);
      } else if (timeout-- < 0) timeoutError;
    }

    const keys = new Array<PLifted<PKey>>();
    const keyStrings = new Array<string>();

    if (size) {
      while (keys.length < size) genKey();
    } else {
      const size_ = genNonNegative(gMaxLength);
      for (let i = 0; i < size_; i++) genKey();
    }
    return keys;
  }

  static genMap<PKey extends PData, PValue extends PData>(
    pkey: PKey,
    pvalue: PValue,
    size: bigint,
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

  public show(tabs = ""): string {
    const tt = tabs + t;
    const ttf = tt + f;
    const ttft = ttf + t;

    const keys = this.keys
      ? this.keys.length > 0
        ? `[\n` + this.keys.map((k) => {
          const key = this.pkey.pconstant(k);
          return ttft + f +
            (typeof key === "bigint" ? key.toString() : JSON.stringify(key));
        }).join(",\n") + `\n${ttft}]`
        : "[]"
      : "undefined";

    return `PMap (
${ttf}pkey: ${this.pkey.show(ttf)},
${ttf}pvalue: ${this.pvalue.show(ttf)},
${ttf}size?: ${this.size},
${ttf}keys?: ${keys}
${tt})`;
  }

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PMap<PData, PData> {
    const pkey = gen.generate(maxDepth - 1n);
    const pvalue = gen.generate(maxDepth - 1n);
    const keys = maybeNdef(() => PMap.genKeys(pkey))?.();
    const size = maybeNdef(BigInt(keys?.length ?? genNonNegative(gMaxLength)));

    return new PMap(pkey, pvalue, size, keys);
  }
}
