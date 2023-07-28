import MBC from './MBC';
import Cartridge from '../cartridge';

class MBC5 extends MBC {
  constructor(cardridge: Cartridge) {
    super(cardridge);
    this.name = 'MBC5';
  }
}

export default MBC5;
