import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  gMaxLength,
  maybeNdef,
  min,
  PList,
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
  public population: number;

  constructor(
    public pkey: PKey,
    public pvalue: PValue,
    public size?: bigint,
    public keys?: PLifted<PKey>[],
    private plutusKeys?: PConstanted<PKey>[],
  ) {
    if (keys) {
      this.population = pvalue.population ** keys.length;
      this.plutusKeys = keys.map((k) => pkey.pconstant(k)) as PConstanted<
        PKey
      >[];
      const length = BigInt(keys.length);
      if (size) {
        assert(length === size, `PMap: wrong size`);
      } else {
        this.size = length;
      }
    } else if (size) {
      this.population = pvalue.population ** Number(size); // overkill
      assert(
        Number(size) <= pkey.population,
        `PMap: not enough keys for size ${size} in\n${pkey.showPType()}`,
      );
    } else this.population = 1; // worst case, consider preventing this by setting minimum size, or using undefined
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
    m.forEach((value: PConstanted<PKey>, key: PConstanted<PValue>) => {
      const k = this.pkey.plift(key);
      assert(
        !this.plutusKeys || Data.to(this.plutusKeys[i++]) === Data.to(key),
        `PMap.pconstant: wrong key of ptype
        ${this.pkey.showPType()}
        : ${key.toString()}`,
      );
      data.set(k, this.pvalue.plift(value));
    });
    return data;
  };

  public pconstant = (
    data: Map<PLifted<PKey>, PLifted<PValue>>,
  ): Map<PConstanted<PKey>, PConstanted<PValue>> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(
      !this.size || this.size === BigInt(data.size),
      `pconstant: wrong size: ${this.size} vs. ${data.size}`,
    );

    const m = new Map<PConstanted<PKey>, PConstanted<PValue>>();
    let i = 0;
    data.forEach((value: PLifted<PKey>, key: PLifted<PValue>) => {
      const k = this.pkey.pconstant(key);
      assert(
        !this.plutusKeys ||
          Data.to(this.plutusKeys[i++]) ===
            Data.to(k),
        `PMap.plift: wrong key`,
      );
      m.set(
        k as PConstanted<PKey>,
        this.pvalue.pconstant(value) as PConstanted<PValue>,
      );
    });
    return m;
  };

  static genKeys<PKey extends PData>(
    pkey: PKey,
    size?: bigint,
  ): PLifted<PKey>[] {
    // console.log(`PMap.genKeys: ${pkey.showPType()}, size: ${Number(size)}`);
    let timeout = gMaxLength + 100n;

    function genKey(): void {
      const key = pkey.genData();
      const keyString = pkey.showData(key);

      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        keys.push(key);
      } else {
        // console.log(
        //   `PMap.genKeys: duplicate key: ${keyString}, timeout: ${
        //     Number(timeout)
        //   }`,
        // );
        if (timeout-- < 0n) {
          throw new Error(
            `Map.genKeys: timeout with
  ${t}keyStrings: ${keyStrings},
  ${t}pkey: ${pkey.showPType(t)},
  ${t}size: ${Number(size)}`,
          );
        }
      }
    }

    const keys = new Array<PLifted<PKey>>();
    const keyStrings = new Array<string>();

    const maxKeys = pkey.population;
    if (size) {
      assert(
        size <= maxKeys,
        `PMap.genKeys: size too big: ${Number(size)} vs. ${maxKeys}`,
      );
      while (keys.length < size) genKey();
    } else {
      const size_ = genNonNegative(
        BigInt(Math.min(Number(gMaxLength), maxKeys)),
      );
      for (let i = 0; i < size_; i++) genKey();
    }
    return keys;
  }

  static genMap<PKey extends PData, PValue extends PData>(
    pkey: PKey,
    pvalue: PValue,
    size: bigint,
  ): Map<PLifted<PKey>, PConstanted<PValue>> {
    assert(
      Number(size) <= pkey.population,
      `PMap: not enough keys for size ${Number(size)} in ${pkey.showPType()}`,
    );
    const m = new Map<PLifted<PKey>, PLifted<PValue>>();
    const keys = PMap.genKeys(pkey, size);
    // console.log(`generating Map with keys: ${JSON.stringify(keys)}`);
    keys.forEach((key: PLifted<PKey>) => {
      m.set(key, pvalue.genData());
    });
    return m;
  }

  public genData = (): Map<PLifted<PKey>, PConstanted<PValue>> => {
    if (this.keys) {
      // console.log(`populating Map with keys: ${JSON.stringify(this.keys)}`);
      const m = new Map<PLifted<PKey>, PConstanted<PValue>>();
      this.keys.forEach((key: PLifted<PKey>) => {
        m.set(key, this.pvalue.genData());
      });
      return m;
    } else {
      // console.log(`generating Data for ${this.showPType()}`);
      const size = this.size ? this.size : genNonNegative(
        BigInt(Math.min(Number(gMaxLength), this.pkey.population)),
      );
      // console.log(`generating Map with size: ${Number(size)}`);
      return PMap.genMap(this.pkey, this.pvalue, size);
    }
  };

  public showData = (
    data: Map<PLifted<PKey>, PLifted<PValue>>,
    tabs = "",
  ): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    return `Map {
${
      [...data.entries()].map(([key, value]) =>
        `${ttf}${this.pkey.showData(key, ttf)} => ${
          this.pvalue.showData(value, ttf)
        }`
      ).join(",\n")
    }
${tt}}`;
  };

  public showPType = (tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;
    const ttft = ttf + t;

    const keys = this.keys
      ? new PList(this.pkey).showData(this.keys, ttft)
      : "undefined";

    return `PMap (
${ttf}population: ${this.population},
${ttf}pkey: ${this.pkey.showPType(ttf)},
${ttf}pvalue: ${this.pvalue.showPType(ttf)},
${ttf}size?: ${this.size},
${ttf}keys?: ${keys}
${tt})`;
  };

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PMap<PData, PData> { // additional maxDepth - 1n intentional
    const pkey = gen.generate(maxDepth - 1n);
    const pvalue = gen.generate(maxDepth - 1n);
    const keys = maybeNdef(() => PMap.genKeys(pkey))?.();
    const size = maybeNdef(
      BigInt(
        keys?.length ??
          genNonNegative(BigInt(Math.min(Number(gMaxLength), pkey.population))),
      ),
    );

    return new PMap(pkey, pvalue, size, keys);
  }
}
