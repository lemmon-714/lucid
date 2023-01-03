import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genNonNegative, maxInteger } from "../../mod.ts";
import { Constr } from "../data.ts";
import { PRecord } from "./record.ts";
import { f, PConstanted, PData, PLifted, PType, RecordOf, t } from "./type.ts";

export class PConstr<PFields extends PData>
  implements PType<Constr<PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  constructor(
    public index: bigint,
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

  public genData = (): RecordOf<PLifted<PFields>> => {
    return this.pfields.genData();
  };

  public show = (tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    return `PConstr (
${ttf}index: ${this.index.toString()},
${ttf}pfields: ${this.pfields.show(ttf)}
${tt})`;
  };

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PConstr<PData> {
    const index = genNonNegative(maxInteger);
    const pfields = PRecord.genPType(gen, maxDepth);
    return new PConstr(index, pfields);
  }
}
