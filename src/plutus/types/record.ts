import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genName, genNonNegative } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PRecord<PT extends PData>
  implements PType<Array<PConstanted<PT>>, RecordOf<PLifted<PT>>> {
  constructor(
    public pfields: RecordOf<PType<PConstanted<PT>, PLifted<PT>>>,
    // public plifted: { new (...params: any): PLifted<PT> },
    public asserts?: ((o: PLifted<PT>) => void)[],
  ) {
  }

  public plift = (l: Array<PConstanted<PT>>): RecordOf<PLifted<PT>> => {
    assert(
      l instanceof Array,
      `Record.plift: expected List: ${l}`,
    );
    const r: Record<string, PLifted<PT>> = {};

    const pfields = Object.entries(this.pfields);
    l.forEach((value, i) => {
      const key = pfields[i][0];
      const pvalue = pfields[i][1];
      r[key] = pvalue.plift(value);
    });
    return r;
  };

  public pconstant = (
    data: RecordOf<PLifted<PT>>,
  ): Array<PConstanted<PT>> => {
    assert(data instanceof Object, `PRecord.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PRecord.pconstant: unexpected Array: ${data}`,
    );

    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(data as PLifted<PT>);
      });
    }

    const l = new Array<PConstanted<PT>>();
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

  public genData = (): RecordOf<PLifted<PT>> => {
    const r: RecordOf<PLifted<PT>> = {};
    Object.entries(this.pfields).forEach(([key, pfield]) => {
      r[key] = pfield.genData();
    });
    return r;
  };

  public genPlutusData = (): PConstanted<PT>[] => {
    // console.log("record");
    const l = new Array<PConstanted<PT>>();
    Object.entries(this.pfields).forEach(([_, pfield]) => {
      l.push(pfield.genPlutusData());
    });
    return l;
  };
}
