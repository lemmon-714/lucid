import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PConstraint<PInner extends PData>
  implements PType<PConstanted<PInner>, PLifted<PInner>> {
  constructor(
    public pinner: PInner,
    public asserts: ((i: PLifted<PInner>) => void)[],
    public genInnerData: () => PLifted<PInner>,
    public genInnerPlutusData: () => PConstanted<PInner>,
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

  public pconstant = (data: PLifted<PInner>): PConstanted<PInner> => {
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

  public genPlutusData = (): PConstanted<PInner> => {
    return this.genInnerPlutusData();
  };

  // public merge = (other: PConstraint<PInner>): PConstraint<PInner> => {
  //   const asserts = this.asserts.concat(other.asserts);
  //   return new PConstraint(
  //     this.pinner,
  //     asserts,
  //     this.genInnerData,
  //     this.genInnerPlutusData,
  //   );
  // };
}
