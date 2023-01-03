import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genString, maxInteger } from "../../mod.ts";
import { PType } from "./type.ts";

export class PByteString implements PType<string, string> {
  public population = Infinity;

  public plift = (s: string): string => {
    assert(
      typeof s === `string`,
      `plift: expected String: ${s}`,
    );
    return s;
  };

  public pconstant = (data: string): string => {
    assert(typeof data === `string`, `pconstant: expected String: ${data}`);
    return data;
  };

  public genData(): string {
    return genString("abcdef");
  }

  public show = (): string => {
    return `PByteString`;
  };

  static genPType(): PByteString {
    return new PByteString();
  }
}
