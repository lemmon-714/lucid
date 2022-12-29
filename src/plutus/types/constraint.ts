import { PConstanted, PData, PLifted, PType } from "./type.ts";

export class PConstraint<PT extends PData>
  implements PType<PConstanted<PT>, PLifted<PT>> {
  constructor(
    public pinner: PT,
    public asserts: ((i: PLifted<PT>) => void)[],
    public genInnerData: () => PLifted<PT>,
    public genInnerPlutusData: () => PConstanted<PT>,
  ) {}

  public plift = (data: PConstanted<PT>): PLifted<PT> => {
    const plifted = this.pinner.plift(data);
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(plifted);
      });
    }
    return plifted;
  };

  public pconstant = (data: PLifted<PT>): PConstanted<PT> => {
    if (this.asserts) {
      this.asserts.forEach((assert) => {
        assert(data);
      });
    }
    return this.pinner.pconstant(data) as PConstanted<PT>;
  };

  public genData = (): PLifted<PT> => {
    return this.genInnerData();
  };

  public genPlutusData = (): PConstanted<PT> => {
    return this.genInnerPlutusData();
  };
}
