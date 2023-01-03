import { Generators } from "../../mod.ts";
import { f, PConstanted, PData, PLifted, PType, t } from "./type.ts";

export class PConstraint<PInner extends PData> {
  // implements PType<PConstanted<PInner>, PLifted<PInner>> {
  constructor(
    public pinner: PInner,
    public asserts: ((i: PLifted<PInner>) => void)[],
    public genInnerData: () => PLifted<PInner>,
  ) {}

  public plift = (data: PConstanted<PInner>): PLifted<PInner> => {
    const plifted = this.pinner.plift(data);
    this.asserts.forEach((assert) => {
      assert(plifted);
    });
    return plifted;
  };

  // @ts-ignore TODO: fix this
  public pconstant = (data: PLifted<PInner>): PConstanted<PInner> => {
    this.asserts.forEach((assert) => {
      assert(data);
    });
    return this.pinner.pconstant(data) as PConstanted<PInner>;
  };

  public genData = (): PLifted<PInner> => {
    return this.genInnerData();
  };

  public show = (tabs = ""): string => {
    const tt = tabs + t;
    const ttf = tt + f;

    const asserts = `[\n
      ${ttf}` + this.asserts.map((a) => {
      return `(${a.toString()})`;
    }).join(`,\n${ttf}`) + `\n
    ${ttf}]`;

    return `PConstraint (
${ttf}pinner: ${this.pinner.show(ttf)},
${ttf}asserts: \${asserts},
${ttf}genInnerData: ${this.genInnerData.toString()}
${tt})`;
  };

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PConstraint<PData> {
    const pinner = gen.generate(maxDepth);
    const genInnerData = pinner.genData;
    return new PConstraint(pinner, [], genInnerData);
  }
}
