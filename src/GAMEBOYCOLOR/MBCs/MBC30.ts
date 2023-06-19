import { MBC } from "./MBC";
import { Cartridge } from "../cartridge";

export class MBC30 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = "MBC30";
  }
}
