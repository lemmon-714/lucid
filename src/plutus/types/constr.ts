import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genNonNegative, maxInteger } from "../../mod.ts";
import { Constr } from "../data.ts";
import { PRecord } from "./record.ts";
import { f, PConstanted, PData, PLifted, PType, RecordOf, t } from "./type.ts";

export class PConstr<PFields extends PData>
  implements PType<Constr<PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  public population: number;

  constructor(
    public index: bigint,
    public pfields: PRecord<PFields>,
  ) {
    this.population = pfields.population;
  }

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

  public showData = (data: RecordOf<PLifted<PFields>>, tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    return `Constr (
${ttf}${this.pfields.showData(data, ttf)}},
${tt})`;
  };

  public showPType = (tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    return `PConstr (
${ttf}population: ${this.population},
${ttf}index: ${this.index.toString()},
${ttf}pfields: ${this.pfields.showPType(ttf)}
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
