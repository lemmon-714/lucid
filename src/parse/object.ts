import { Generators, PlutusData } from "../mod.ts";
import { PRecord } from "./record.ts";
import { PType, RecordOf } from "./type.ts";

export class PObject<P extends PlutusData, T> implements PType<Array<P>, T> {
  constructor(
    public precord: PRecord<P, any>, // TODO better type here
    public anew: { new (...params: any): T },
    public asserts?: ((o: T) => void)[],
  ) {}

  public plift = (l: Array<P>): T => {
    const record = this.precord.plift(l);
    const o = new this.anew(...Object.values(record));
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(o);
      });
    }
    return o;
  };

  public pconstant = (data: T): Array<P> => {
    return this.precord.pconstant(data as RecordOf<any>);
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PObject<PlutusData, any> {
    throw new Error("not implemented");
  }

  public genData = (): T => {
    const record = this.precord.genData();
    const o = new this.anew(...Object.values(record));
    return o;
  };

  public genPlutusData = (): P[] => {
    console.log("object");
    const record = this.precord.genPlutusData();
    return Object.values(record);
  };
}
