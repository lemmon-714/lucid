import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { fromHex, Generators, genNonNegative, toHex } from "../../mod.ts";
import { PByteString } from "./bytestring.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PMapRecord<PFields extends PData>
  implements
    PType<Map<string, PConstanted<PFields>>, RecordOf<PLifted<PFields>>> {
  constructor(
    public pfields: RecordOf<PFields>,
  ) {
    for (const key in pfields) {
      try {
        toHex(fromHex(key));
      } catch (e) {
        throw new Error(`PMapRecord: key is not a valid hex string: ${key}`);
      }
    }
  }

  public plift = (
    m: Map<string, PConstanted<PFields>>,
  ): RecordOf<PLifted<PFields>> => {
    assert(
      m instanceof Map,
      `MapRecord.plift: expected Map: ${m}`,
    );
    const r: Record<string, PLifted<PFields>> = {};

    m.forEach((value, key) => {
      const pvalue = this.pfields[key];
      r[key] = pvalue.plift(value);
    });
    return r;
  };

  public pconstant = (
    data: RecordOf<PLifted<PFields>>,
  ): Map<string, PConstanted<PFields>> => {
    assert(data instanceof Object, `PMapRecord.pconstant: expected Object`);

    const pfieldsNames = Object.getOwnPropertyNames(this.pfields);
    const dataFieldsNames = Object.getOwnPropertyNames(data);
    assert(
      pfieldsNames.toString() === dataFieldsNames.toString(),
      "PMapRecord.pconstant: fields mismatch",
    );

    const m = new Map<string, PConstanted<PFields>>();
    Object.entries(data).forEach(([key, value]) => {
      const pfield = this.pfields[key];
      assert(pfield, `field not found: ${key}`);
      m.set(key, pfield.pconstant(value) as PConstanted<PFields>);
    });
    return m;
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PMapRecord<PData> {
    const pfields: RecordOf<PData> = {};
    const maxi = genNonNegative(maxLength);
    const pbytes = new PByteString();
    for (let i = 0; i < maxi; i++) {
      const key = pbytes.genData();
      const pvalue = gen.generate(maxDepth, maxLength);
      pfields[key] = pvalue;
    }
    return new PMapRecord(pfields);
  }

  public genData = (): RecordOf<PLifted<PFields>> => {
    const r: RecordOf<PLifted<PFields>> = {};
    Object.entries(this.pfields).forEach(([key, pfield]) => {
      r[key] = pfield.genData();
    });
    return r;
  };
}
