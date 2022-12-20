import { PlutusData } from "../types/mod.ts";
import { PByteString } from "./pbytestring.ts";
import { PInteger } from "./pinteger.ts";
import { PMap } from "./pmap.ts";

/*
PType - for parser-type. Also a nod to Plutarch.
It's basically a crude runtime type system for data parsing.
Each class represents a mechanism to create the corresponding
non-P-type, not actual data.
plift parses, pconstant composes.
T is the equivalent concrete type.
*/

export interface PType<P extends PlutusData, T> {
  plift(data: P): T;
  pconstant(data: T): P;
  // genPType(gen: Generators, maxDepth: number, maxLength: number): PType<PlutusData, any>; // static
  genData(): T;
  genPlutusData(): P;
}

export type RecordOf<T> = Record<string, T>;

// examples

// const PValue = new PMap(
//   new PByteString(),
//   new PMap(new PByteString(), new PInteger()),
// );

// type Value = Map<string, Map<string, bigint>>;
// const valueData: Value = new Map<string, Map<string, bigint>>();
