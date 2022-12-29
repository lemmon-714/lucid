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
import { PConstanted, PLifted, PType, PTypes, RecordOf } from "./type.ts";

export class PConstr<PFields extends PData>
  implements PType<Constr<PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  constructor(
    public index: number,
    public pfields: PRecord<PFields>,
  ) {}

  public plift = (
    c: Constr<PConstanted<PFields>>,
  ): RecordOf<PLifted<PFields>> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(
      this.index === c.index,
      `plift: wrong constr index: ${this} vs. ${c}`,
    );
    return this.pfields.plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<PLifted<PFields>>,
  ): Constr<PConstanted<PFields>> => {
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

  public genData = (): RecordOf<PLifted<PFields>> => {
    return this.pfields.genData();
  };

  public genPlutusData = (): Constr<PConstanted<PFields>> => {
    // console.log("constr");
    const fields = this.pfields.genPlutusData();
    return new Constr(this.index, fields);
  };
}
Object.defineProperty(PTypes, "constr", PConstr);
