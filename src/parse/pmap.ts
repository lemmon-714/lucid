import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Data,
  Generators,
  genNumber,
  gMaxLength,
  maybeNdef,
  PlutusData,
  toPlutusData,
} from "../mod.ts";
import { PType } from "./ptype.ts";

export class PMap<KP extends PlutusData, VP extends PlutusData, KT, VT>
  implements PType<Map<KP, VP>, Map<KT, VT>> {
  constructor(
    public pkey: PType<KP, KT>,
    public pvalue: PType<VP, VT>,
    public size?: number,
    public asserts?: ((m: Map<KT, VT>) => void)[],
  ) {}

  public plift = (
    m: Map<KP, VP>,
  ): Map<KT, VT> => {
    assert(m instanceof Map, `plift: expected Map`);
    assert(
      !this.size || this.size === m.size,
      `plift: wrong size: ${JSON.stringify(this)} vs. ${JSON.stringify(m)}`,
    );
    const p = new Map<KT, VT>();
    m.forEach((value: VP, key: KP) => {
      p.set(this.pkey.plift(key), this.pvalue.plift(value));
    });
    if (this.asserts) this.asserts.forEach((a) => a(p));
    return p;
  };

  public pconstant = (
    data: Map<KT, VT>,
  ): Map<KP, VP> => {
    assert(data instanceof Map, `pconstant: expected Map`);
    assert(!this.size || this.size === data.size, `pconstant: wrong size`);
    if (this.asserts) this.asserts.forEach((a) => a(data));
    const m = new Map<KP, VP>();
    data.forEach((value, key) => {
      m.set(this.pkey.pconstant(key), this.pvalue.pconstant(value));
    });
    return m;
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PMap<PlutusData, PlutusData, any, any> {
    const pkey = gen.generate(maxDepth - 1, maxLength);
    const pvalue = gen.generate(maxDepth - 1, maxLength);
    const size = maybeNdef(genNumber(maxLength));

    return new PMap(pkey, pvalue, size);
  }

  public genData = (): Map<KT, VT> => {
    const size = this.size ? this.size : genNumber(gMaxLength);
    const m = new Map<KT, VT>();
    const keyStrings = new Array<string>();
    let timeout = 10;
    while (m.size < size) {
      const key = this.pkey.genData();
      const keyString = Data.to(toPlutusData(key));
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        const value = this.pvalue.genData();
        m.set(key, value);
      } else if (timeout-- < 0) {
        throw new Error(
          `timeout: ${JSON.stringify(keyStrings)}\nkey: ${
            JSON.stringify(this.pkey)
          }`,
        );
      }
    }
    return m;
  };

  public genPlutusData = (): Map<KP, VP> => {
    console.log("map");
    const size = this.size ? this.size : genNumber(gMaxLength);
    const m = new Map<KP, VP>();
    const keyStrings = new Array<string>();
    let timeout = 10;
    while (m.size < size) {
      const key = this.pkey.genPlutusData();
      const keyString = Data.to(key);
      if (!keyStrings.includes(keyString)) {
        keyStrings.push(keyString);
        const value = this.pvalue.genPlutusData();
        m.set(key, value);
      } else if (timeout-- < 0) {
        throw new Error(
          `timeout: ${JSON.stringify(keyStrings)}\nkey: ${
            JSON.stringify(this.pkey)
          }`,
        );
      }
    }
    return m;
  };
}
