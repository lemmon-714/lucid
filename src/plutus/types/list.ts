import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, gMaxLength, maybeNdef } from "../../mod.ts";
import { genNonNegative } from "../../utils/generators.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PList<PT extends PData>
  implements PType<Array<PConstanted<PT>>, Array<PLifted<PT>>> {
  constructor(
    public pelem: PType<PConstanted<PT>, PLifted<PT>>,
    public length?: number,
    public asserts?: ((l: Array<PLifted<PT>>) => void)[],
  ) {
    assert(!length || length >= 0, "negative length");
  }

  public plift = (l: Array<PConstanted<PT>>): Array<PLifted<PT>> => {
    assert(l instanceof Array, `List.plift: expected List: ${l}`);
    assert(
      !this.length || this.length === l.length,
      `plift: wrong length - ${this.length} vs. ${l.length}`,
    );
    const l_ = l.map((elem) => this.pelem.plift(elem));
    if (this.asserts) this.asserts.forEach((a) => a(l_));
    return l_;
  };

  public pconstant = (data: Array<PLifted<PT>>): Array<PConstanted<PT>> => {
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
  ): PList<PData> {
    const length = maybeNdef(genNonNegative(maxLength));
    const pelem = gen.generate(maxDepth, maxLength);
    return new PList(pelem, length);
  }

  public genData = (): PLifted<PT>[] => {
    const length = this.length ? this.length : genNonNegative(gMaxLength);
    const l = new Array<PLifted<PT>>();
    for (let i = 0; i < length; i++) {
      l.push(this.pelem.genData());
    }
    return l;
  };

  public genPlutusData = (): PConstanted<PT>[] => {
    // console.log("map");
    const length = this.length ? this.length : genNonNegative(gMaxLength);
    const l = new Array<PConstanted<PT>>();
    for (let i = 0; i < length; i++) {
      l.push(this.pelem.genPlutusData());
    }
    return l;
  };
}
