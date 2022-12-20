// import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
// import { PlutusData } from "../types/mod.ts";
// import {
//   Generators,
//   genName,
//   genNumber,
//   genString,
//   gMaxLength,
//   maxInteger,
//   maybeNdef,
//   randomChoice,
//   toPlutusData,
// } from "../utils/generators.ts";
// import { Constr, Data } from "./data.ts";

// /*
// PType - for parser-type. Also a nod to Plutarch.
// It's basically a crude runtime type system for data parsing.
// Each class represents a mechanism to create the corresponding
// non-P-type, not actual data.
// plift parses, pconstant composes.
// T is the equivalent concrete type.
// */

// export interface PType<P extends PlutusData, T> {
//   plift(data: P): T;
//   pconstant(data: T): P;
//   // genPType(gen: Generators, maxDepth: number, maxLength: number): PType<PlutusData, any>; // static
//   genData(): T;
// }

// export type RecordOf<T> = Record<string, T>;

// // export type PLifted<T extends PType<T>> = ReturnType<T[`plift`]>;

// /** the most general type. Similar to any or undefined.
//  * TODO consider type checks in the functions still.
//  */
// export class PData<P extends PlutusData> implements PType<P, P> {
//   constructor(
//     public asserts?: ((d: PlutusData) => void)[],
//   ) {}

//   public plift(data: P): P {
//     if (this.asserts) this.asserts.forEach((a) => a(data));
//     return data;
//   }

//   public pconstant(data: P): P {
//     // if (this.asserts) this.asserts.forEach((a) => a(data)); // TODO FIXME
//     return data;
//   }

//   static genPType(): PData<PlutusData> {
//     return new PData();
//   }

//   public genData(): P {
//     throw new Error("not implemented");
//   }
// }

// export class PInteger implements PType<bigint, bigint> {
//   constructor(
//     public asserts?: ((i: bigint) => void)[],
//   ) {}

//   public plift = (i: bigint): bigint => {
//     assert(
//       typeof i === `bigint`,
//       `plift: expected Integer: ${i}`,
//     );
//     if (this.asserts) this.asserts.forEach((a) => a(i));
//     return i;
//   };

//   public pconstant = (data: bigint): bigint => {
//     assert(typeof data === `bigint`, `pconstant: expected Integer`);
//     if (this.asserts) this.asserts.forEach((a) => a(data));
//     return data;
//   };

//   static genPType(): PInteger {
//     return new PInteger();
//   }

//   public genData(): bigint {
//     return BigInt(genNumber(maxInteger));
//   }
// }

// export class PByteString implements PType<string, string> {
//   constructor(
//     public asserts?: ((s: string) => void)[],
//   ) {}

//   public plift = (s: string): string => {
//     assert(
//       typeof s === `string`,
//       `plift: expected String: ${s}`,
//     );
//     if (this.asserts) this.asserts.forEach((a) => a(s));
//     return s;
//   };

//   public pconstant = (data: string): string => {
//     assert(typeof data === `string`, `pconstant: expected String: ${data}`);
//     if (this.asserts) this.asserts.forEach((a) => a(data));
//     return data;
//   };

//   static genPType(): PByteString {
//     return new PByteString();
//   }

//   public genData(): string {
//     return genString("abcdef");
//   }
// }

// export class PList<P extends PlutusData, T>
//   implements PType<Array<P>, Array<T>> {
//   constructor(
//     public pelem: PType<P, T>,
//     public length?: number,
//     public asserts?: ((l: Array<T>) => void)[],
//   ) {
//     assert(!length || length >= 0, "negative length");
//   }

//   public plift = (l: Array<P>): Array<T> => {
//     assert(l instanceof Array, `List.plift: expected List: ${l}`);
//     assert(
//       !this.length || this.length === l.length,
//       `plift: wrong length - ${this.length} vs. ${l.length}`,
//     );
//     const l_ = l.map((elem) => this.pelem.plift(elem));
//     if (this.asserts) this.asserts.forEach((a) => a(l_));
//     return l_;
//   };

//   public pconstant = (data: Array<T>): Array<P> => {
//     assert(data instanceof Array, `pconstant: expected Array`);
//     assert(
//       !this.length || this.length === data.length,
//       `pconstant: wrong length`,
//     );
//     if (this.asserts) this.asserts.forEach((a) => a(data));
//     return data.map(this.pelem.pconstant);
//   };

//   static genPType(
//     gen: Generators,
//     maxLength: number,
//     maxDepth: number,
//   ): PList<PlutusData, any> {
//     const length = maybeNdef(genNumber(maxLength));
//     const pelem = gen.generate(maxDepth, maxLength);
//     return new PList(pelem, length);
//   }

//   public genData = (): T[] => {
//     const length = this.length ? this.length : genNumber(gMaxLength);
//     const l = new Array<T>();
//     for (let i = 0; i < length; i++) {
//       l.push(this.pelem.genData());
//     }
//     return l;
//   };
// }

// export class PMap<KP extends PlutusData, VP extends PlutusData, KT, VT>
//   implements PType<Map<KP, VP>, Map<KT, VT>> {
//   constructor(
//     public pkey: PType<KP, KT>,
//     public pvalue: PType<VP, VT>,
//     public size?: number,
//     public asserts?: ((m: Map<KT, VT>) => void)[],
//   ) {}

//   public plift = (
//     m: Map<KP, VP>,
//   ): Map<KT, VT> => {
//     assert(m instanceof Map, `plift: expected Map`);
//     assert(
//       !this.size || this.size === m.size,
//       `plift: wrong size: ${JSON.stringify(this)} vs. ${JSON.stringify(m)}`,
//     );
//     const p = new Map<KT, VT>();
//     m.forEach((value: VP, key: KP) => {
//       p.set(this.pkey.plift(key), this.pvalue.plift(value));
//     });
//     if (this.asserts) this.asserts.forEach((a) => a(p));
//     return p;
//   };

//   public pconstant = (
//     data: Map<KT, VT>,
//   ): Map<KP, VP> => {
//     assert(data instanceof Map, `pconstant: expected Map`);
//     assert(!this.size || this.size === data.size, `pconstant: wrong size`);
//     if (this.asserts) this.asserts.forEach((a) => a(data));
//     const m = new Map<KP, VP>();
//     data.forEach((value, key) => {
//       m.set(this.pkey.pconstant(key), this.pvalue.pconstant(value));
//     });
//     return m;
//   };

//   static genPType(
//     gen: Generators,
//     maxDepth: number,
//     maxLength: number,
//   ): PMap<PlutusData, PlutusData, any, any> {
//     const pkey = gen.generate(maxDepth - 1, maxLength / 2);
//     const pvalue = gen.generate(maxDepth - 1, maxLength / 2);
//     const size = maybeNdef(genNumber(maxLength));
//     return new PMap(pkey, pvalue, size);
//   }

//   public genData = (): Map<KT, VT> => {
//     const size = this.size ? this.size : genNumber(gMaxLength);
//     const m = new Map<KT, VT>();
//     const keyStrings = new Array<string>();
//     while (m.size < size) {
//       const key = this.pkey.genData();
//       const keyString = Data.to(toPlutusData(key));
//       if (!keyStrings.includes(keyString)) {
//         keyStrings.push(keyString);
//         const value = this.pvalue.genData();
//         m.set(key, value);
//       }
//     }
//     return m;
//   };
// }

// export class PConstr<P extends PlutusData, T>
//   implements PType<Constr<P>, RecordOf<T>> {
//   constructor(
//     public index: number,
//     public pfields: PRecord<P, T>,
//   ) {}

//   public plift = (
//     c: Constr<P>,
//   ): RecordOf<T> => {
//     assert(c instanceof Constr, `plift: expected Constr`);
//     assert(
//       this.index === c.index,
//       `plift: wrong constr index: ${this} vs. ${c}`,
//     );
//     return this.pfields.plift(c.fields);
//   };

//   public pconstant = (
//     data: RecordOf<T>,
//   ): Constr<P> => {
//     assert(data instanceof Object, `PConstr.pconstant: expected Object`);
//     assert(
//       !(data instanceof Array),
//       `PConstr.pconstant: unexpected Array: ${data}`,
//     );
//     return new Constr(this.index, this.pfields.pconstant(data));
//   };

//   static genPType(
//     gen: Generators,
//     maxDepth: number,
//     maxLength: number,
//   ): PConstr<PlutusData, any> {
//     const index = genNumber(maxInteger);
//     const pfields = PRecord.genPType(gen, maxDepth, maxLength);
//     return new PConstr(index, pfields);
//   }

//   public genData = (): RecordOf<T> => {
//     return this.pfields.genData();
//   };
// }

// export class PSum<P extends PlutusData, T>
//   implements PType<Constr<P>, RecordOf<T>> {
//   constructor(
//     public pconstrs: Array<PRecord<P, T>>,
//   ) {}

//   public plift = (
//     c: Constr<P>,
//   ): RecordOf<T> => {
//     assert(c instanceof Constr, `plift: expected Constr`);
//     assert(c.index < this.pconstrs.length, `plift: constr index out of bounds`);
//     return this.pconstrs[c.index].plift(c.fields);
//   };

//   public pconstant = (
//     data: RecordOf<T>,
//   ): Constr<P> => {
//     assert(data instanceof Object, `PSum.pconstant: expected Object`);
//     assert(
//       !(data instanceof Array),
//       `PSum.pconstant: unexpected Array: ${data}`,
//     );
//     throw new Error(`pconstant: not implemented`); // TODO something about matching maybe
//   };

//   static genPType(
//     gen: Generators,
//     maxDepth: number,
//     maxLength: number,
//   ): PSum<PlutusData, any> {
//     const pconstrs = new Array<PRecord<PlutusData, any>>();
//     const maxi = genNumber(maxLength);
//     for (let i = 0; i < maxi; i++) {
//       pconstrs.push(PRecord.genPType(gen, maxDepth, maxLength));
//     }
//     return new PSum(pconstrs);
//   }

//   public genData(): RecordOf<T> {
//     return randomChoice(this.pconstrs).genData();
//   }
// }

// export class PObject<P extends PlutusData, T> implements PType<Array<P>, T> {
//   constructor(
//     public precord: PRecord<P, any>, // TODO better type here
//     public anew: { new (...params: any): T },
//     public asserts?: ((o: T) => void)[],
//   ) {}

//   public plift = (l: Array<P>): T => {
//     const record = this.precord.plift(l);
//     const o = new this.anew(...Object.values(record));
//     if (this.asserts) {
//       this.asserts.forEach((assert) => {
//         assert(o);
//       });
//     }
//     return o;
//   };

//   public pconstant = (data: T): Array<P> => {
//     return this.precord.pconstant(data as RecordOf<any>);
//   };

//   static genPType(
//     gen: Generators,
//     maxDepth: number,
//     maxLength: number,
//   ): PObject<PlutusData, any> {
//     throw new Error("not implemented");
//   }

//   public genData(): T {
//     const record = this.precord.genData();
//     const o = new this.anew(...Object.values(record));
//     return o;
//   }
// }

// export class PRecord<P extends PlutusData, T>
//   implements PType<Array<P>, RecordOf<T>> {
//   constructor(
//     public pfields: RecordOf<PType<P, T>>,
//     // public plifted: { new (...params: any): T },
//     public asserts?: ((o: T) => void)[],
//   ) {
//   }

//   public plift = (l: Array<P>): RecordOf<T> => {
//     assert(
//       l instanceof Array,
//       `Record.plift: expected List: ${l}`,
//     );
//     const r: Record<string, T> = {};

//     const pfields = Object.entries(this.pfields);
//     l.forEach((value, i) => {
//       const key = pfields[i][0];
//       const pvalue = pfields[i][1];
//       r[key] = pvalue.plift(value);
//     });
//     return r;
//   };

//   public pconstant = (
//     data: RecordOf<T>,
//   ): Array<P> => {
//     assert(data instanceof Object, `PRecord.pconstant: expected Object`);
//     assert(
//       !(data instanceof Array),
//       `PRecord.pconstant: unexpected Array: ${data}`,
//     );

//     if (this.asserts) {
//       this.asserts.forEach((assert) => {
//         assert(data as T);
//       });
//     }

//     const l = new Array<P>();
//     Object.entries(data).forEach(([key, value]) => {
//       const pfield = this.pfields[key];
//       assert(pfield, `field not found: ${key}`);
//       l.push(pfield.pconstant(value));
//     });
//     return l;
//   };

//   static genPType(
//     gen: Generators,
//     maxDepth: number,
//     maxLength: number,
//   ): PRecord<PlutusData, any> {
//     const pfields: RecordOf<PType<PlutusData, any>> = {};
//     const maxi = genNumber(maxLength);
//     for (let i = 0; i < maxi; i++) {
//       const key = genName();
//       const pvalue = gen.generate(maxDepth - 1, maxLength / 2);
//       pfields[key] = pvalue;
//     }
//     return new PRecord(pfields);
//   }

//   public genData = (): RecordOf<T> => {
//     const r: RecordOf<T> = {};
//     Object.entries(this.pfields).forEach(([key, pfield]) => {
//       r[key] = pfield.genData();
//     });
//     return r;
//   };
// }

// // type PObject<T extends Record<string, PType<T>>> = {
// //   [Key in keyof T]: PLifted<T[Key]>;
// // };

// // examples

// const PValue = new PMap(
//   new PByteString(),
//   new PMap(new PByteString(), new PInteger()),
// );

// type Value = Map<string, Map<string, bigint>>;
// const valueData: Value = new Map<string, Map<string, bigint>>();
