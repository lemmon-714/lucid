import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Generators,
  genNonNegative,
  maxInteger,
  PData,
  PlutusData,
} from "../../mod.ts";
import { Constr } from "../data.ts";
import { PRecord } from "./record.ts";
import { PConstanted, PLifted, PType, RecordOf } from "./type.ts";

export class PConstr<PT extends PData>
  implements PType<Constr<PConstanted<PT>>, RecordOf<PLifted<PT>>> {
  constructor(
    public index: number,
    public pfields: PRecord<PT>,
  ) {}

  public plift = (
    c: Constr<PConstanted<PT>>,
  ): RecordOf<PLifted<PT>> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(
      this.index === c.index,
      `plift: wrong constr index: ${this} vs. ${c}`,
    );
    return this.pfields.plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<PLifted<PT>>,
  ): Constr<PConstanted<PT>> => {
    assert(data instanceof Object, `PConstr.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PConstr.pconstant: unexpected Array: ${data}`,
    );
    return new Constr(this.index, this.pfields.pconstant(data));
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PConstr<PData> {
    const index = genNonNegative(maxInteger);
    const pfields = PRecord.genPType(gen, maxDepth, maxLength);
    return new PConstr(index, pfields);
  }

  public genData = (): RecordOf<PLifted<PT>> => {
    return this.pfields.genData();
  };

  public genPlutusData = (): Constr<PConstanted<PT>> => {
    // console.log("constr");
    const fields = this.pfields.genPlutusData();
    return new Constr(this.index, fields);
  };
}
