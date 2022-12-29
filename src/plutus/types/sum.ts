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
import { PType, RecordOf } from "./type.ts";

export class PSum<P extends PlutusData, T>
  implements PType<Constr<P>, RecordOf<T>> {
  constructor(
    public pconstrs: Array<PRecord<P, T>>,
  ) {}

  public plift = (
    c: Constr<P>,
  ): RecordOf<T> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(c.index < this.pconstrs.length, `plift: constr index out of bounds`);
    return this.pconstrs[c.index].plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<T>,
  ): Constr<P> => {
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
  ): PSum<PlutusData, any> {
    const pconstrs = new Array<PRecord<PlutusData, any>>();
    const maxi = genPositive(maxLength);
    for (let i = 0; i < maxi; i++) {
      pconstrs.push(PRecord.genPType(gen, maxDepth, maxLength));
    }
    return new PSum(pconstrs);
  }

  public genData = (): RecordOf<T> => {
    return randomChoice(this.pconstrs).genData();
  };

  public genPlutusData = (): Constr<P> => {
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
