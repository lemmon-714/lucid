/*
PType - for parser-type. Also a nod to Plutarch.
It's basically a crude runtime type system for data parsing.
Each class represents a mechanism to create the corresponding
non-P-type, not actual data.
plift parses, pconstant composes.
T is the equivalent concrete type.
*/

import { PlutusData } from "../../types/types.ts";
import { Constr } from "../data.ts";
import { PLiteral } from "./literal.ts";

export type RecordOf<T> = Record<string, T>;
export type PData = PType<PlutusData, any>;
export type PConstanted<PT extends PData> = ReturnType<
  PT["pconstant"]
>; //| PT extends PConstr<PT> ? Constr<PConstanted<PT>> : never;
export type PLifted<PT extends PData> = ReturnType<
  PT["plift"]
>;

export type PlutusOf<T> = T extends PlutusData ? T
  : T extends Array<infer E> ? Array<PlutusOf<E>>
  : T extends Map<infer K, infer V> ? Map<PlutusOf<K>, PlutusOf<V>>
  : T extends Constr<infer F> ? Array<PlutusOf<F>>
  : T extends Object ? PlutusOfObject<T>
  : never;
export type PlutusOfObject<T extends Object> = Array<PlutusOf<T[keyof T]>>;

export interface PType<P extends PlutusData, T> {
  plift(data: P): T;
  pconstant(data: T): P;
  // abstract genPType(gen: Generators, maxDepth: number, maxLength: number): PData; // static
  genData(): T;
  show(tabs?: string): string;
}
export type Constructor<T> = new (...args: any[]) => T;
export const PTypes: RecordOf<PData> = {};

export type PMaybeLiteral<T extends PData> = T | PLiteral<T>;

export const f = "+  ";
export const t = "   ";
