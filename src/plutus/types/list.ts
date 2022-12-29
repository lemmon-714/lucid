import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, gMaxLength, maybeNdef, PlutusData } from "../../mod.ts";
import { genNonNegative } from "../../utils/generators.ts";
import { PType } from "./type.ts";

export class PList<P extends PlutusData, T>
  implements PType<Array<P>, Array<T>> {
  constructor(
    public pelem: PType<P, T>,
    public length?: number,
    public asserts?: ((l: Array<T>) => void)[],
  ) {
    assert(!length || length >= 0, "negative length");
  }

  public plift = (l: Array<P>): Array<T> => {
    assert(l instanceof Array, `List.plift: expected List: ${l}`);
    assert(
      !this.length || this.length === l.length,
      `plift: wrong length - ${this.length} vs. ${l.length}`,
    );
    const l_ = l.map((elem) => this.pelem.plift(elem));
    if (this.asserts) this.asserts.forEach((a) => a(l_));
    return l_;
  };

  public pconstant = (data: Array<T>): Array<P> => {
    assert(data instanceof Array, `pconstant: expected Array`);
    assert(
      !this.length || this.length === data.length,
      `pconstant: wrong length`,
    );
    if (this.asserts) this.asserts.forEach((a) => a(data));
    return data.map(this.pelem.pconstant);
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PList<PlutusData, any> {
    const length = maybeNdef(genNonNegative(maxLength));
    const pelem = gen.generate(maxDepth, maxLength);
    return new PList(pelem, length);
  }

  public genData = (): T[] => {
    const length = this.length ? this.length : genNonNegative(gMaxLength);
    const l = new Array<T>();
    for (let i = 0; i < length; i++) {
      l.push(this.pelem.genData());
    }
    return l;
  };

  public genPlutusData = (): P[] => {
    // console.log("map");
    const length = this.length ? this.length : genNonNegative(gMaxLength);
    const l = new Array<P>();
    for (let i = 0; i < length; i++) {
      l.push(this.pelem.genPlutusData());
    }
    return l;
  };
}
