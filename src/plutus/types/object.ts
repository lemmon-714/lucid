import { Generators } from "../../mod.ts";
import { PRecord } from "./record.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

// type FieldsOf<PFields extends PData> = Array<PLifted< PFields[keyof PFields] >>

export class PObject<
  PFields extends PData,
  O extends Object,
> implements PType<Array<PConstanted<PFields>>, O> {
  constructor(
    public precord: PRecord<PFields>, // TODO better type here
    public anew: new (...args: Array<PLifted<PFields>>) => O,
  ) {}

  public plift = (l: Array<PConstanted<PFields>>): O => {
    const record = this.precord.plift(l);
    const o = new this.anew(
      ...Object.values(record),
    );
    return o;
  };

  public pconstant = (
    data: O,
  ): Array<PConstanted<PFields>> => {
    return this.precord.pconstant(data as RecordOf<PLifted<PFields>>);
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PObject<PData, abstract new (...args: PLifted<PData>) => Object> {
    throw new Error("not implemented");
  }

  public genData = (): O => {
    const record = this.precord.genData();
    const o = new this.anew(
      ...Object.values(record),
    );
    return o;
  };

  public genPlutusData = (): PConstanted<PFields>[] => {
    // console.log("object");
    const record = this.precord.genPlutusData();
    return Object.values(record);
  };
}
