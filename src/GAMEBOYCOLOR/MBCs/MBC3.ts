import { MBC } from "./MBC";
import { Cartridge } from "../cartridge";

export class MBC3 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = "MBC3";
  }
}
