// var fs = require("fs")
var CPU = require("./cpu")
var PPU = require("./ppu")
var Cartridge = require("./cartridge")
var Display = require("./display")
var Player  = require("./player")
var Joypad  = require("./joypad")

var Nes = function(){
    this.cpu = new CPU(this)
    this.ppu = new PPU(this)
    this.cartridge = new Cartridge(this)
    this.player1 =  new Player(this);
    this.player2 =  new Player(this);
    this.joypad  =  new Joypad(this);
}


Nes.prototype.player   = function(index){
    if (index == 0){
        return this.player1;
    }
    if (index == 1){
        return this.player2;
    }
}

Nes.prototype.loadFile = function(){
    // var data = fs.readFileSync('D:/nestest/mlo.nes');
    // console.log("AAAAAAAAAA",data)
    // this.cartridge.load(data)
    // console.log(this.cartridge.mapper)
    // setInterval(()=>{nes.cpu.run_frame()}, 1000/60)
}

Nes.prototype.load = function(rom){
    this.cartridge.load(rom)
}


Nes.prototype.run = function(){
    setInterval(()=>{nes.cpu.run_frame()}, 1000/60)
}

Nes.prototype.registerDisplay = function(display){
    this.ppu.set_display(display)
}

Nes.prototype.test = function(){
    console.log("Hello FC Game!")
}


// module.exports = Nes
export function FC_Game(){
    return new Nes();
};

export function FC_Display(gl){
    return new Display(gl);
}