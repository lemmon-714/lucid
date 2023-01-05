import { assert, assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Data, f, gMaxLength, PData, PlutusData, PType, t } from "../../mod.ts";
import { Generators, gMaxDepth } from "./generators.ts";
import { maxInteger } from "./mod.ts";

export function proptestPTypes(gen: Generators, iterations: number) {
  const popErrs = new Map<string, number>();
  const dataErrs = new Map<string, number>();
  const ptypeErrs = new Map<string, number>();
  const otherErrs = new Map<string, number>();

  for (let i = 0; i < iterations; i++) {
    const errs = popErrs.size + dataErrs.size + ptypeErrs.size + otherErrs.size;
    console.log(`${i}` + (errs ? ` (${errs} errors)` : ""));
    try {
      // console.log("generating ptype")
      const ptype = gen.generate(gMaxDepth);
      // console.log("generating data for " + ptype.showPType(t));
      const data = ptype.genData();
      // console.log("constanting " + ptype.showData(data));
      const plutusData = ptype.pconstant(data);
      // console.log(ptype.showData(data));

      // console.log(`testing population of ${ptype.showPType(t)}`)
      // testPopulation(ptype, popErrs);
      // console.log("testing data parsing")
      testDataParse(plutusData, dataErrs);
      // console.log("testing ptype parsing")
      testPTypeParse(plutusData, data, ptype, ptypeErrs);
    } catch (err) {
      logError(err, otherErrs);
    }
  }
  let correct = iterations;
  correct -= printErrs(popErrs, "Population errors");
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
    console.error(`\n${num} x ${err}`);
    total += num;
  });
  if (total) {
    console.log(`${name} ==> total: ${record.size} (${total})\n`);
  } else {
    console.log(`==> no ${name}\n`);
  }
  return total;
}

// testing that population is indeed large
function testBigPopulation(ptype: PData, errors: Map<string, number>) {
  return
  // const popStrings: string[] = [];
  // let consecutiveHits = 0

  // try {
  //   for (let i = 0; i < 100; i++) {
  //     const p = ptype.genData();
  //     const s = ptype.showData(p);
  //     if (!popStrings.includes(s)) {
  //       popStrings.push(s);
  //     } else {
  //       if (consecutiveHits++ > 3) {
  //         throw new Error(`consecutiveHits: ${consecutiveHits} in ${ptype.showPType()}`);
  //       }
  //     }
  //   }
  // } catch (err) {
  //   logError(err, errors);
  // }
}

// testing exact population match
function testSmallPopulation(ptype: PData, errors: Map<string, number>) {
  const popStrings: string[] = [];

  try {
    assert(ptype.population > 0, "population must be positive")
    
    for (let i = 0; i < ptype.population ** 2; i++) {
      const p = ptype.genData();
      const s = ptype.showData(p);
      if (!popStrings.includes(s)) {
        popStrings.push(s);
      }
    }
    assert(
      ptype.population <= popStrings.length,
      `popStrings.length: ${popStrings.length} less than population of\n${ptype.showPType()}\n`
      // popStrings: [${popStrings.join(`\n${f}`)}]`,
    );
  } catch (err) {
    logError(err, errors);
  }
}

function testPopulation(ptype: PData, errors: Map<string, number>) {
  if (ptype.population >= 100n) testBigPopulation(ptype, errors);
  else testSmallPopulation(ptype, errors);
}
