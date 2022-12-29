import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  genPositive,
  PlutusData,
  randomChoice,
} from "../../mod.ts";
import { Constr } from "../data.ts";

import { PRecord } from "./record.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PSum<PT extends PData>
  implements PType<Constr<PConstanted<PT>>, RecordOf<PLifted<PT>>> {
  constructor(
    public pconstrs: Array<PRecord<PT>>,
  ) {}

  public plift = (
    c: Constr<PConstanted<PT>>,
  ): RecordOf<PLifted<PT>> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(c.index < this.pconstrs.length, `plift: constr index out of bounds`);
    return this.pconstrs[c.index].plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<PLifted<PT>>,
  ): Constr<PConstanted<PT>> => {
    assert(data instanceof Object, `PSum.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PSum.pconstant: unexpected Array: ${data}`,
    );
    throw new Error(`pconstant: not implemented`); // TODO something about matching maybe
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PSum<PData> {
    const pconstrs = new Array<PRecord<PData>>();
    const maxi = genPositive(maxLength);
    for (let i = 0; i < maxi; i++) {
      pconstrs.push(PRecord.genPType(gen, maxDepth, maxLength));
    }
    return new PSum(pconstrs);
  }

  public genData = (): RecordOf<PLifted<PT>> => {
    return randomChoice(this.pconstrs).genData();
  };

  public genPlutusData = (): Constr<PConstanted<PT>> => {
    // console.log("sum");
    const index = genNonNegative(this.pconstrs.length);
    const constr = this.pconstrs[index];
    assert(
      constr,
      `constr not found (index ${index} of ${this.pconstrs.length})`,
    );
    const fields = constr.genPlutusData();
    return new Constr(index, fields);
  };
}
