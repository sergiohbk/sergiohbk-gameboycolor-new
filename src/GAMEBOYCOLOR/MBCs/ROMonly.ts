import { MBC } from "./MBC";
import { Cartridge } from "../cartridge";

export class ROMonly extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = "ROMONLY";
  }
}
