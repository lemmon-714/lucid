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
} from "../src/mod.ts";
import { PLiteral } from "../src/plutus/types/literal.ts";
import { propertyTestPTypesParsing } from "./utils.ts";

Deno.test("parsing property tests", () => {
  const gen = new Generators(
    lucidPrimitiveGenerators,
    lucidContainerGenerators,
  );
  propertyTestPTypesParsing(gen, 1000);
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
