import { Generators } from "../../mod.ts";
import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PConstraint<PInner extends PData>
  implements PType<PConstanted<PInner>, PLifted<PInner>> {
  constructor(
    public pinner: PInner,
    public asserts: ((i: PLifted<PInner>) => void)[],
    public genInnerData: () => PLifted<PInner>,
  ) {}

  public plift = (data: PConstanted<PInner>): PLifted<PInner> => {
    const plifted = this.pinner.plift(data);
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(plifted);
      });
    }
    return plifted;
  };

  public pconstant = (data: PLifted<PInner>): PConstanted<any> => {
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(data);
      });
    }
    return this.pinner.pconstant(data) as PConstanted<PInner>;
  };

  public genData = (): PLifted<PInner> => {
    return this.genInnerData();
  };

  static genPType(
    gen: Generators,
    maxDepth: number,
    maxLength: number,
  ): PConstraint<PData> {
    const pinner = gen.generate(maxDepth, maxLength);
    const genInnerData = pinner.genData;
    return new PConstraint(pinner, [], genInnerData);
  }
}
