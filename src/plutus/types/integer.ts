import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genNumber, maxInteger } from "../../mod.ts";
import { PType } from "./type.ts";

export class PInteger implements PType<bigint, bigint> {
  public population = Infinity;

  public plift = (i: bigint): bigint => {
    assert(
      typeof i === `bigint`,
      `.PInteger.plift: expected Integer: ${i}`,
    );
    return i;
  };

  public pconstant = (data: bigint): bigint => {
    assert(typeof data === `bigint`, `PInteger.pconstant: expected Integer`);
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
