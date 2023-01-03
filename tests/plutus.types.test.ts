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
  propertyTestPTypesParsing,
} from "../mod.ts";
import { PLiteral } from "../src/plutus/types/literal.ts";

Deno.test("parsing property tests", () => {
  const gen = new Generators(
    lucidPrimitiveGenerators,
    lucidContainerGenerators,
  );
  propertyTestPTypesParsing(gen, 100);
});

const lucidPrimitiveGenerators = [
  // PAny.genPType,
  PInteger.genPType,
  PByteString.genPType,
];

const lucidContainerGenerators = [
  PList.genPType,
  PMap.genPType,
  PConstr.genPType,
  PRecord.genPType,
  PMapRecord.genPType,
  // PSum.genPType,
  PObject.genPType,
  PLiteral.genPType,
  PConstraint.genPType,
];
