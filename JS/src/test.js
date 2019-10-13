var fs = require("fs")
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


Nes.prototype.loadFile = function(){
    // var data = fs.readFileSync('D:/nestest/mlo.nes');
    // var data = fs.readFileSync('D:/nestest/hdl.nes');
    var data = fs.readFileSync('/Users/yll/Project/nodejs/fcjs/nestest/hdl.nes');
    // console.log("AAAAAAAAAA",data)
    data = Int16Array.from(data)
    this.cartridge.load(data)
    // console.log(this.cartridge.mapper)
    setInterval(()=>{nes.cpu.run_frame()}, 1000/60)
}


Nes.prototype.load = function(rom){
    this.cartridge.load(rom)
}

Nes.prototype.player   = function(index){
    if (index == 0){
        return this.player1;
    }
    if (index == 1){
        return this.player2;
    }
}

Nes.prototype.run = function(){
    setInterval(()=>{nes.cpu.run_frame()}, 1000/60)
}

Nes.prototype.registerDisplay = function(display){
    this.ppu.set_display(display)
}





Nes.prototype.benchmarks = function(){
    var fr= 120;
    var begin = new Date();
    console.log(begin);
    while (fr--) {
        nes.cpu.run_frame()
    }
    var end = new Date();
    console.log(end)
    console.log("Time:", end - begin + "ms")
    
}

Nes.prototype.loadTest = function(){
    var data = fs.readFileSync('/Users/yll/Project/nodejs/fcjs/nestest/hdl.nes');
    data = Int16Array.from(data)
    this.cartridge.load(data)
    this.benchmarks()
}

var nes = new Nes()
// nes.loadFile();
nes.loadTest()