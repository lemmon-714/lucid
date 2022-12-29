import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genNumber } from "../../mod.ts";
import { PConstraint } from "./constraint.ts";

import { PType } from "./type.ts";

export class PInteger implements PType<bigint, bigint> {
  constructor() {}

  public plift = (i: bigint): bigint => {
    assert(
      typeof i === `bigint`,
      `plift: expected Integer: ${i}`,
    );
    return i;
  };

  public pconstant = (data: bigint): bigint => {
    assert(typeof data === `bigint`, `pconstant: expected Integer`);
    return data;
  };

  static genPType(): PInteger {
    return new PInteger();
  }

  public genData = (): bigint => {
    return BigInt(genNumber());
  };

  public genPlutusData(): bigint {
    // console.log("integer");
    return this.genData();
  }
}
