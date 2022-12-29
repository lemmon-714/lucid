import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { genString } from "../mod.ts";
import { PType } from "./type.ts";

export class PByteString implements PType<string, string> {
  constructor(
    public asserts?: ((s: string) => void)[],
  ) {}

  public plift = (s: string): string => {
    assert(
      typeof s === `string`,
      `plift: expected String: ${s}`,
    );
    if (this.asserts) this.asserts.forEach((a) => a(s));
    return s;
  };

  public pconstant = (data: string): string => {
    assert(typeof data === `string`, `pconstant: expected String: ${data}`);
    if (this.asserts) this.asserts.forEach((a) => a(data));
    return data;
  };

  static genPType(): PByteString {
    return new PByteString();
  }

  public genData(): string {
    return genString("abcdef");
  }

  public genPlutusData(): string {
    console.log("bytestring");
    return this.genData();
  }
}
