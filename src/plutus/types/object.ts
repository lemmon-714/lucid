import { Generators } from "../../mod.ts";
import { PRecord } from "./record.ts";
import { PConstanted, PData, PLifted, PType, RecordOf } from "./type.ts";

export class PObject<PT extends PData>
  implements PType<Array<PConstanted<PT>>, PLifted<PT>> {
  constructor(
    public precord: PRecord<PT>, // TODO better type here
    public anew: { new (...params: any): PLifted<PT> },
    public asserts?: ((o: PLifted<PT>) => void)[],
  ) {}

  public plift = (l: Array<PConstanted<PT>>): PLifted<PT> => {
    const record = this.precord.plift(l);
    const o = new this.anew(...Object.values(record));
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(o);
      });
    }
    return o;
  };

  public pconstant = (data: PLifted<PT>): Array<PConstanted<PT>> => {
    return this.precord.pconstant(data as RecordOf<any>);
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PObject<PData> {
    throw new Error("not implemented");
  }

  public genData = (): PLifted<PT> => {
    const record = this.precord.genData();
    const o = new this.anew(...Object.values(record));
    return o;
  };

  public genPlutusData = (): PConstanted<PT>[] => {
    // console.log("object");
    const record = this.precord.genPlutusData();
    return Object.values(record);
  };
}
