import { PlutusData } from "../../mod.ts";
import { PType } from "./type.ts";

/** the most general type. Similar to any or undefined.
 * TODO consider type checks in the functions still.
 */
export class PAny<P extends PlutusData> implements PType<P, P> {
  public population = 0; // because not implemented

  public plift(data: P): P {
    return data;
  }

  public pconstant(data: P): P {
    return data;
  }

  public genData(): P {
    throw new Error("not implemented");
  }

  public show = (): string => {
    return `PAny`;
  };

  static genPType(): PAny<PlutusData> {
    return new PAny();
  }
}
