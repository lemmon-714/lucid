import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { PlutusData } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PLiteral<PT extends PData>
  implements PType<PConstanted<PT>, PLifted<PT>> {
  //   public pliteral: PT;
  public literal: PLifted<PT>;
  public plutusLiteral: PConstanted<PT>;
  constructor(
    public pliteral: PT,
    literal?: PLifted<PT>,
    plutusLiteral?: PConstanted<PT>,
  ) {
    assert(
      literal || plutusLiteral,
      "Must provide either literal or plutusLiteral",
    );
    this.literal = literal ?? pliteral.plift(plutusLiteral!);
    this.plutusLiteral = plutusLiteral ??
      pliteral.pconstant(literal!) as PLifted<PT>;
  }

  plift = (l: PConstanted<PT>): PLifted<PT> => {
    assert(l === this.plutusLiteral, "Literal does not match");
    return this.literal;
  };
  pconstant = (data: PLifted<PT>): PConstanted<PT> => {
    assert(data === this.literal, "Literal does not match");
    return this.plutusLiteral;
  };
  genData = (): PLifted<PT> => {
    return this.literal;
  };
  genPlutusData = (): PConstanted<PT> => {
    return this.plutusLiteral;
  };
}
