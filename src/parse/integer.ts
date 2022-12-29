import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genNumber, maxInteger } from "../mod.ts";
import { PType } from "./type.ts";

export class PInteger implements PType<bigint, bigint> {
  constructor(
    public asserts?: ((i: bigint) => void)[],
  ) {}

  public plift = (i: bigint): bigint => {
    assert(
      typeof i === `bigint`,
      `plift: expected Integer: ${i}`,
    );
    if (this.asserts) this.asserts.forEach((a) => a(i));
    return i;
  };

  public pconstant = (data: bigint): bigint => {
    assert(typeof data === `bigint`, `pconstant: expected Integer`);
    if (this.asserts) this.asserts.forEach((a) => a(data));
    return data;
  };

  static genPType(): PInteger {
    return new PInteger();
  }

  public genData(): bigint {
    return BigInt(genNumber(maxInteger));
  }

  public genPlutusData(): bigint {
    console.log("integer");
    return this.genData();
  }
}
