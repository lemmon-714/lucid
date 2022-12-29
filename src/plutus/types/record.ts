import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, genName, genNonNegative, PlutusData } from "../../mod.ts";
import { PType, RecordOf } from "./type.ts";

export class PRecord<P extends PlutusData, T>
  implements PType<Array<P>, RecordOf<T>> {
  constructor(
    public pfields: RecordOf<PType<P, T>>,
    // public plifted: { new (...params: any): T },
    public asserts?: ((o: T) => void)[],
  ) {
  }

  public plift = (l: Array<P>): RecordOf<T> => {
    assert(
      l instanceof Array,
      `Record.plift: expected List: ${l}`,
    );
    const r: Record<string, T> = {};

    const pfields = Object.entries(this.pfields);
    l.forEach((value, i) => {
      const key = pfields[i][0];
      const pvalue = pfields[i][1];
      r[key] = pvalue.plift(value);
    });
    return r;
  };

  public pconstant = (
    data: RecordOf<T>,
  ): Array<P> => {
    assert(data instanceof Object, `PRecord.pconstant: expected Object`);
    assert(
      !(data instanceof Array),
      `PRecord.pconstant: unexpected Array: ${data}`,
    );

    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(data as T);
      });
    }

    const l = new Array<P>();
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
  ): PRecord<PlutusData, any> {
    const pfields: RecordOf<PType<PlutusData, any>> = {};
    const maxi = genNonNegative(maxLength);
    for (let i = 0; i < maxi; i++) {
      const key = genName();
      const pvalue = gen.generate(maxDepth, maxLength);
      pfields[key] = pvalue;
    }
    return new PRecord(pfields);
  }

  public genData = (): RecordOf<T> => {
    const r: RecordOf<T> = {};
    Object.entries(this.pfields).forEach(([key, pfield]) => {
      r[key] = pfield.genData();
    });
    return r;
  };

  public genPlutusData = (): P[] => {
    // console.log("record");
    const l = new Array<P>();
    Object.entries(this.pfields).forEach(([_, pfield]) => {
      l.push(pfield.genPlutusData());
    });
    return l;
  };
}
