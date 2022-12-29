import { Constr, Generators, PlutusData } from "../../mod.ts";
import { PAny } from "./any.ts";
import { PByteString } from "./bytestring.ts";
import { PConstr } from "./constr.ts";
import { PInteger } from "./integer.ts";
import { PList } from "./list.ts";
import { PMap } from "./map.ts";
import { PRecord } from "./record.ts";
import {
  PConstanted,
  PData,
  PLifted,
  PlutusOf,
  PlutusOfObject,
  PType,
  PTypes,
  RecordOf,
} from "./type.ts";

type PTypeOf<T> = T extends bigint ? PInteger
  : T extends string ? PByteString
  : T extends Array<infer E> ? PList<PTypeOf<E>>
  : T extends Map<infer K, infer V> ? PMap<PTypeOf<K>, PTypeOf<V>>
  : T extends Constr<infer F> ? PConstr<PTypeOf<F>>
  : T extends Object ? PObject<T>
  : PAny<PlutusOf<T>>;

type PFieldsOf<O> = PTypeOf<O[keyof O]>;
type PRecordOf<O> = RecordOf<PFieldsOf<O>>;

type DSGsfgs = PRecordOf<ExampleClass>;

type AttributeTypes<T> = {
  [K in keyof T]: T[K] extends object ? AttributeTypes<T[K]> : T[K];
}[keyof T];

// for a given type T, create a type of all the types of the fields of T
type FieldsOf<T> = {
  [K in keyof T]: T[K] extends object ? FieldsOf<T[K]> : T[K];
};
// type Constructor<T> = new (...args: any[]) => T;

type AAA = FieldsOf<ExampleClass>;
type BBB = AttributeTypes<ExampleClass>;
type CCC = Array<AttributeTypes<ExampleClass>>;

type Test = PFieldsOf<ExampleClass>;
type T2 = PLifted<Test>;
type T3 = Array<PLifted<Test>>;
type T4 = Array<PLifted<PFieldsOf<ExampleClass>>>;

const T: T4 = [BigInt(3), "aaa"];

export class PObject<O extends Object> implements PType<PlutusOfObject<O>, O> {
  // public precord: PRecord<PData>;
  constructor(
    public precord: PRecord<PData>, // TODO WIP
    public anew: new (...args: any[]) => O,
  ) {
    // const record: RecordOf<PData> = {};
    // const obj = new anew();
    // console.log(obj);
    // for (const [key, value] of Object.entries(obj)) {
    //   console.log(value.constructor.name);
    //   record[key] = PTypes[value.constructor.name];
    // }
    // this.precord = new PRecord(record);
  }

  public plift = (l: PlutusOfObject<O>): O => {
    const record: RecordOf<PLifted<PFieldsOf<O>>> = this.precord.plift(
      l as Array<PConstanted<PFieldsOf<O>>>,
    );
    const args = Object.values(record);
    return new (this.anew)(...args as AttributeTypes<ExampleClass>[]) as O;
  };

  public pconstant = (
    data: O,
  ): PlutusOfObject<O> => {
    return this.precord.pconstant(
      data as RecordOf<PLifted<PFieldsOf<O>>>,
    ) as PlutusOfObject<O>;
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PObject<ExampleClass> {
    throw new Error("Not implemented");
    // return new PObject(ExampleClass);
  }

  public genData = (): O => {
    const record = this.precord.genData();
    // console.log(record, JSON.stringify(record));
    const o = new this.anew(
      ...Object.values(record),
    );
    // console.log(o, JSON.stringify(o));
    return o;
  };

  public genPlutusData = (): PlutusOfObject<O> => {
    const record = this.precord.genPlutusData();
    return Object.values(record) as PlutusOfObject<O>;
  };
}

class ExampleClass {
  constructor(
    public s: string,
    public i: bigint,
    // public ls: string[],
    // public li: bigint[],
    // public msli: Map<string, bigint[]>,
    // public mlis: Map<bigint[], string>,
  ) {}
}
