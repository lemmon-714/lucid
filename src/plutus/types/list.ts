import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, gMaxLength, maybeNdef } from "../../mod.ts";
import { genNonNegative } from "../../utils/generators.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PList<PElem extends PData>
  implements PType<Array<PConstanted<PElem>>, Array<PLifted<PElem>>> {
  constructor(
    public pelem: PElem,
    public length?: bigint,
  ) {
    assert(!length || length >= 0, "negative length");
  }

  public plift = (l: Array<PConstanted<PElem>>): Array<PLifted<PElem>> => {
    assert(l instanceof Array, `List.plift: expected List: ${l}`);
    assert(
      !this.length || this.length === BigInt(l.length),
      `plift: wrong length - ${this.length} vs. ${l.length}`,
    );
    const data = l.map((elem) => this.pelem.plift(elem));
    return data;
  };

  public pconstant = (
    data: Array<PLifted<PElem>>,
  ): Array<PConstanted<PElem>> => {
    assert(data instanceof Array, `pconstant: expected Array`);
    assert(
      !this.length || this.length === BigInt(data.length),
      `pconstant: wrong length`,
    );
    return data.map(this.pelem.pconstant) as Array<PConstanted<PElem>>;
  };

  static genList<T>(
    elemGenerator: () => T,
    length: bigint,
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

  static genPType(
    gen: Generators,
    maxDepth: bigint,
    maxLength: bigint,
  ): PList<PData> {
    const length = maybeNdef(genNonNegative(maxLength));
    const pelem = gen.generate(maxDepth, maxLength);
    return new PList(pelem, length);
  }
}
