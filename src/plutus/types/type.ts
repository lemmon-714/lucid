/*
PType - for parser-type. Also a nod to Plutarch.
It's basically a crude runtime type system for data parsing.
Each class represents a mechanism to create the corresponding
non-P-type, not actual data.
plift parses, pconstant composes.
T is the equivalent concrete type.
*/

import { PlutusData } from "../../types/types.ts";

export type PConstanted<PT extends PType<PlutusData, any>> = ReturnType<
  PT["pconstant"]
>; //| PT extends PConstr<PT> ? Constr<PConstanted<PT>> : never;
export type PLifted<PT extends PType<PlutusData, any>> = ReturnType<
  PT["plift"]
>;

export interface PType<P extends PlutusData, T> {
  plift(data: P): T;
  pconstant(data: T): P;
  // genPType(gen: Generators, maxDepth: number, maxLength: number): PType<PlutusData, any>; // static
  genData(): T;
  genPlutusData(): P;
}

export type RecordOf<T> = Record<string, T>;
export type PData = PType<PlutusData, any>;
