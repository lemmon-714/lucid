import { Generators } from "../../mod.ts";
import { PRecord } from "./record.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

// type FieldsOf<PFields extends PData> = Array<PLifted< PFields[keyof PFields] >>

export class PObject<
  PFields extends PData,
  O extends abstract new (...args: any) => any,
> implements PType<Array<PConstanted<PFields>>, O> {
  constructor(
    public precord: PRecord<PFields>, // TODO better type here
    public anew: {
      new (...params: ConstructorParameters<O>): PLifted<PFields>;
    },
  ) {}

  public plift = (l: Array<PConstanted<PFields>>): O => {
    const record = this.precord.plift(l);
    const o = new this.anew(
      ...Object.values(record) as ConstructorParameters<O>,
    );
    return o;
  };

  public pconstant = (
    data: ConstructorParameters<O>,
  ): Array<PConstanted<PFields>> => {
    return this.precord.pconstant(data as RecordOf<any>);
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PObject<PData, any> {
    throw new Error("not implemented");
  }

  public genData = (): PLifted<PFields> => {
    const record = this.precord.genData();
    const o = new this.anew(
      ...Object.values(record) as ConstructorParameters<O>,
    );
    return o;
  };

  public genPlutusData = (): PConstanted<PFields>[] => {
    // console.log("object");
    const record = this.precord.genPlutusData();
    return Object.values(record);
  };
}
