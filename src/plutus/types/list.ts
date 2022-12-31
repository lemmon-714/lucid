import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, gMaxLength, maybeNdef } from "../../mod.ts";
import { genNonNegative } from "../../utils/generators.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PList<PElem extends PData>
  implements PType<Array<PConstanted<PElem>>, Array<PLifted<PElem>>> {
  constructor(
    public pelem: PType<PConstanted<PElem>, PLifted<PElem>>,
    public length?: number,
  ) {
    assert(!length || length >= 0, "negative length");
  }

  public plift = (l: Array<PConstanted<PElem>>): Array<PLifted<PElem>> => {
    assert(l instanceof Array, `List.plift: expected List: ${l}`);
    assert(
      !this.length || this.length === l.length,
      `plift: wrong length - ${this.length} vs. ${l.length}`,
    );
    const l_ = l.map((elem) => this.pelem.plift(elem));
    return l_;
  };

  public pconstant = (
    data: Array<PLifted<PElem>>,
  ): Array<PConstanted<PElem>> => {
    assert(data instanceof Array, `pconstant: expected Array`);
    assert(
      !this.length || this.length === data.length,
      `pconstant: wrong length`,
    );
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

  static genList<T>(
    elemGenerator: () => T,
    length: number,
  ): Array<T> {
    const l = new Array<T>();
    for (let i = 0; i < length; i++) {
      l.push(elemGenerator());
    }
    return l;
  }

  public genData = (): PLifted<PElem>[] => {
    const length = this.length ? this.length : genNonNegative(gMaxLength);
    return PList.genList(this.pelem.genData, length);
  };

  // public genPlutusData = (): PConstanted<PElem>[] => {
  //   const length = this.length ? this.length : genNonNegative(gMaxLength);
  //   return PList.genList(this.pelem.genPlutusData, length);
  // };
}
