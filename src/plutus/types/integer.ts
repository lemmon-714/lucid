import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genNumber } from "../../mod.ts";

import { PType, t } from "./type.ts";

export class PInteger implements PType<bigint, bigint> {
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

  public genData = (): bigint => {
    return genNumber();
  };

  public show = (): string => {
    return `PInteger`;
  };

  static genPType(): PInteger {
    return new PInteger();
  }
}
