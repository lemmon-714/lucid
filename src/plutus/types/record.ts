import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genName, genNonNegative } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PRecord<PFields extends PData>
  implements PType<Array<PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  constructor(
    public pfields: RecordOf<PType<PConstanted<PFields>, PLifted<PFields>>>,
  ) {
  }

  public plift = (
    l: Array<PConstanted<PFields>>,
  ): RecordOf<PLifted<PFields>> => {
    assert(
      l instanceof Array,
      `Record.plift: expected List: ${l}`,
    );
    const r: Record<string, PLifted<PFields>> = {};

    const pfields = Object.entries(this.pfields);
    l.forEach((value, i) => {
      const key = pfields[i][0];
      const pvalue = pfields[i][1];
      r[key] = pvalue.plift(value);
    });
    return r;
  };

  public pconstant = (
    data: RecordOf<PLifted<PFields>>,
  ): Array<PConstanted<PFields>> => {
    assert(data instanceof Object, `PRecord.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PRecord.pconstant: unexpected Array: ${data}`,
    );

    const l = new Array<PConstanted<PFields>>();
    Object.entries(data).forEach(([key, value]) => {
      const pfield = this.pfields[key];
      assert(pfield, `field not found: ${key}`);
      l.push(pfield.pconstant(value));
    });
    return l;
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
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

  public genData = (): RecordOf<PLifted<PFields>> => {
    const r: RecordOf<PLifted<PFields>> = {};
    Object.entries(this.pfields).forEach(([key, pfield]) => {
      r[key] = pfield.genData();
    });
    return r;
  };

  public genPlutusData = (): PConstanted<PFields>[] => {
    // console.log("record");
    const l = new Array<PConstanted<PFields>>();
    Object.entries(this.pfields).forEach(([_, pfield]) => {
      l.push(pfield.genPlutusData());
    });
    return l;
  };
}
