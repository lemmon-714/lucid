import {
  Generators,
  PByteString,
  PConstr,
  PConstraint,
  PInteger,
  PList,
  PMap,
  PMapRecord,
  PObject,
  PRecord,
  proptestPTypes,
} from "../mod.ts";
import { PLiteral } from "../src/plutus/types/literal.ts";

Deno.test("parsing property tests", () => {
  const gen = new Generators(
    lucidPrimitiveGenerators,
    lucidContainerGenerators,
  );
  proptestPTypes(gen, 1000);
});

const lucidPrimitiveGenerators = [
  // PAny.genPType,
  PInteger.genPType,
  PByteString.genPType,
];

const lucidContainerGenerators = [
  PLiteral.genPType,
  PConstraint.genPType,
  PList.genPType,
  PMap.genPType,
  PMapRecord.genPType,
  PConstr.genPType,
  PRecord.genPType,
  // PSum.genPType,
  PObject.genPType,
];
