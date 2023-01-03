import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genName,
  genNonNegative,
  genPositive,
  PlutusData,
  randomChoice,
} from "../../mod.ts";
import { Constr } from "../data.ts";

import { PRecord } from "./record.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PSum<PFields extends PData>
  implements PType<Constr<PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  constructor(
    public pconstrs: Array<PRecord<PFields>>,
  ) {}

  public plift = (
    c: Constr<PConstanted<PFields>>,
  ): RecordOf<PLifted<PFields>> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(c.index < this.pconstrs.length, `plift: constr index out of bounds`);
    return this.pconstrs[Number(c.index)].plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<PLifted<PFields>>,
  ): Constr<PConstanted<PFields>> => {
    assert(data instanceof Object, `PSum.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PSum.pconstant: unexpected Array: ${data}`,
    );
    throw new Error(`pconstant: not implemented`); // TODO something about matching maybe
  };

  public genData = (): RecordOf<PLifted<PFields>> => {
    return randomChoice(this.pconstrs).genData();
  };

  static genPType(
    gen: Generators,
    maxDepth: bigint,
    maxLength: bigint,
  ): PRecord<PData> {
    const pfields: RecordOf<PData> = {};
    const maxi = genNonNegative(maxLength);
    for (let i = 0; i < maxi; i++) {
      const key = genName();
      const pvalue = gen.generate(maxDepth, maxLength);
      pfields[key] = pvalue;
    }
    return new PRecord(pfields);
  }
}
