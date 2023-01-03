import { Generators } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

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

  static genPType(
    gen: Generators,
    maxDepth: bigint,
  ): PConstraint<PData> {
    const pinner = gen.generate(maxDepth);
    const genInnerData = pinner.genData;
    return new PConstraint(pinner, [], genInnerData);
  }
}
