import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Generators } from "../../mod.ts";
import { f, PConstanted, PData, PLifted, PType, t } from "./type.ts";

export class PLiteral<PT extends PData>
  implements PType<PConstanted<PT>, PLifted<PT>> {
  public population = 1;
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

  public showData = (data: PLifted<PT>, tabs = ""): string => {
    assert(
      data === this.literal,
      // `Literal does not match: ${this.showData(data)} vs. ${
      //   this.showData(this.literal)
      // }`,
    );
    const tt = tabs + t;
    const ttf = tt + f;

    return `Literal (
${ttf}${this.pliteral.showData(data, ttf)}
${tt})`;
  };

  public showPType = (tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    return `PLiteral (
${ttf}population: ${this.population},
${ttf}plutusLiteral: ${this.pliteral.showPType(ttf)},
${ttf}literal: TODO implement
${tt})`;
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
