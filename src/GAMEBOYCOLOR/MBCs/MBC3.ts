import MBC from './MBC';
import Cartridge from '../cartridge';

class MBC3 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = 'MBC3';
  }
}

export default MBC3;
