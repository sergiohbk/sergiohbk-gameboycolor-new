export class FLAGS{
    //----CONSOLE FLOW----
    doubleSpeed: boolean;
    GBCmode: boolean;
    CPUstop: boolean;
    CPUhalt: boolean;
    //----INTERRUPT CONTROL----
    IME: boolean;
    constructor(){
        this.doubleSpeed = false;
        this.GBCmode = false;
        this.CPUstop = false;
        this.CPUhalt = false;
        this.IME = false;
    }

    reset() {
        this.doubleSpeed = false;
        this.GBCmode = false;
        this.CPUstop = false;
        this.CPUhalt = false;
        this.IME = false;
    }
}