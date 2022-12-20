import { PlutusData } from "../mod.ts";
import { PType } from "./ptype.ts";

/** the most general type. Similar to any or undefined.
 * TODO consider type checks in the functions still.
 */
export class PData<P extends PlutusData> implements PType<P, P> {
  constructor(
    public asserts?: ((d: PlutusData) => void)[],
  ) {}

  public plift(data: P): P {
    if (this.asserts) this.asserts.forEach((a) => a(data));
    return data;
  }

  public pconstant(data: P): P {
    // if (this.asserts) this.asserts.forEach((a) => a(data)); // TODO FIXME
    return data;
  }

  static genPType(): PData<PlutusData> {
    return new PData();
  }

  public genData(): P {
    throw new Error("not implemented");
  }

  public genPlutusData(): P {
    throw new Error("not implemented");
  }
}
