class FLAGS {
  //----CONSOLE FLOW----
  doubleSpeed: boolean;
  CPUstop: boolean;
  CPUhalt: boolean;
  //----INTERRUPT CONTROL----
  IME: boolean;
  constructor() {
    this.doubleSpeed = false;
    this.CPUstop = false;
    this.CPUhalt = false;
    this.IME = false;
  }

  reset() {
    this.doubleSpeed = false;
    this.CPUstop = false;
    this.CPUhalt = false;
    this.IME = false;
  }
}

export default FLAGS;
