import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators, PlutusData } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PLiteral<PT extends PData>
  implements PType<PConstanted<PT>, PLifted<PT>> {
  public plutusLiteral: PConstanted<PT>;
  constructor(
    public pliteral: PT,
    public literal: PLifted<PT>,
  ) {
    this.plutusLiteral = pliteral.pconstant(literal) as PConstanted<PT>;
  }

  public plift = (l: PConstanted<PT>): PLifted<PT> => {
    assert(l === this.plutusLiteral, "Literal does not match");
    return this.literal;
  };
  public pconstant = (data: PLifted<PT>): PConstanted<PT> => {
    assert(data === this.literal, "Literal does not match");
    return this.plutusLiteral;
  };
  public genData = (): PLifted<PT> => {
    return this.literal;
  };

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PLiteral<PData> {
    const pliteral = gen.generate(maxDepth);
    const literal = pliteral.genData();
    return new PLiteral(pliteral, literal);
  }
}
