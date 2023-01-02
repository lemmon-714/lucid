import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { fromHex, Generators, genNonNegative, toHex } from "../../mod.ts";
import { PByteString } from "./bytestring.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PMapRecord<PFields extends PData>
  implements
    PType<Map<string, PConstanted<PFields>>, Map<string, PLifted<PFields>>> {
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
  ): Map<string, PLifted<PFields>> => {
    assert(
      m instanceof Map,
      `MapRecord.plift: expected Map: ${m}`,
    );
    const data = new Map<string, PLifted<PFields>>();

    m.forEach((value, key) => {
      const pvalue = this.pfields[key];
      data.set(key, pvalue.plift(value));
    });
    return data;
  };

  public pconstant = (
    data: Map<string, PLifted<PFields>>,
  ): Map<string, PConstanted<PFields>> => {
    assert(data instanceof Map, `PMapRecord.pconstant: expected Map`);

    const pfieldsNames = Object.getOwnPropertyNames(this.pfields);
    const dataFieldsNames = [...data.keys()].toString();
    assert(
      pfieldsNames.toString() === dataFieldsNames.toString(),
      "PMapRecord.pconstant: fields mismatch",
    );

    const m = new Map<string, PConstanted<PFields>>();
    data.forEach((value, key) => {
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

  public genData = (): Map<string, PLifted<PFields>> => {
    const m = new Map<string, PLifted<PFields>>();
    Object.entries(this.pfields).forEach(([key, pfield]) => {
      m.set(key, pfield.genData());
    });
    return m;
  };
}
