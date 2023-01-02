import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import {
  Data,
  Generators,
  gMaxDepth,
  gMaxLength,
  PByteString,
  PConstr,
  PInteger,
  PList,
  PlutusData,
  PMap,
  PMapRecord,
  PObject,
  PRecord,
  PType,
} from "../src/mod.ts";

Deno.test("parsing property tests", () => {
  const gen = new Generators(
    lucidPrimitiveGenerators,
    lucidContainerGenerators,
  );
  propertyTestPTypesParsing(gen);
});

export const lucidPrimitiveGenerators = [
  // PData.genPType,
  PInteger.genPType,
  PByteString.genPType,
];

export const lucidContainerGenerators = [
  PList.genPType,
  PMap.genPType,
  PConstr.genPType,
  PRecord.genPType,
  PMapRecord.genPType,
  // PSum.genPType,
  PObject.genPType,
];

export function propertyTestPTypesParsing(gen: Generators) {
  const dataErrs = new Map<string, number>();
  const ptypeErrs = new Map<string, number>();
  const otherErrs = new Map<string, number>();

  const iterations = 100;
  for (let i = 0; i < iterations; i++) {
    console.log(i);
    try {
      const ptype = gen.generate(gMaxDepth, gMaxLength);
      const data = ptype.genData();
      const plutusData = ptype.pconstant(data);

      testDataParse(plutusData, dataErrs);
      testPTypeParse(plutusData, data, ptype, ptypeErrs);
    } catch (err) {
      logError(err, otherErrs);
    }
  }
  let correct = iterations;
  correct -= printErrs(dataErrs, "Data parsing errors");
  correct -= printErrs(ptypeErrs, "PType parsing errors");
  correct -= printErrs(otherErrs, "other errors");

  console.log(correct + " x correct");
  assertEquals(correct, iterations);
}

function testDataParse(plutusData: PlutusData, errors: Map<string, number>) {
  try {
    assertEquals(plutusData, Data.from(Data.to(plutusData)));
  } catch (err) {
    logError(err, errors);
  }
}

function testPTypeParse(
  plutusData: PlutusData,
  data: any,
  ptype: PType<PlutusData, any>,
  errors: Map<string, number>,
) {
  try {
    assertEquals(data, ptype.plift(plutusData));
  } catch (err) {
    logError(err, errors);
  }
}

function logError(err: Error, record: Map<string, number>) {
  const e = err.message; //[err.name, err.message, err.cause, err.stack].join("\n");
  const num = record.get(e);
  record.set(e, num ? num + 1 : 1);
}

function printErrs(record: Map<string, number>, name: string): number {
  let total = 0;
  record.forEach((num: number, err: string) => {
    console.error(num + " x " + err);
    total += num;
  });
  if (total) {
    console.log(`${name} ==> total: ${record.size} (${total})\n`);
  } else {
    console.log(`==> no ${name}\n`);
  }
  return total;
}
