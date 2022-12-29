import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genNumber, maxInteger, PlutusData } from "../../mod.ts";
import { Constr } from "../data.ts";
import { PRecord } from "./record.ts";
import { PType, RecordOf } from "./type.ts";

export class PConstr<P extends PlutusData, T>
  implements PType<Constr<P>, RecordOf<T>> {
  constructor(
    public index: number,
    public pfields: PRecord<P, T>,
  ) {}

  public plift = (
    c: Constr<P>,
  ): RecordOf<T> => {
    assert(c instanceof Constr, `plift: expected Constr`);
    assert(
      this.index === c.index,
      `plift: wrong constr index: ${this} vs. ${c}`,
    );
    return this.pfields.plift(c.fields);
  };

  public pconstant = (
    data: RecordOf<T>,
  ): Constr<P> => {
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
  ): PConstr<PlutusData, any> {
    const index = genNumber(maxInteger);
    const pfields = PRecord.genPType(gen, maxDepth, maxLength);
    return new PConstr(index, pfields);
  }

  public genData = (): RecordOf<T> => {
    return this.pfields.genData();
  };

  public genPlutusData = (): Constr<P> => {
    // console.log("constr");
    const fields = this.pfields.genPlutusData();
    return new Constr(this.index, fields);
  };
}
