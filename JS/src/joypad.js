var joypad_bits = new Uint8Array(2)
var strobe = false;


function Joypad(nes){
    this.nes = nes;
}

Joypad.prototype.read_state = function(n){
    if (strobe)
        return 0x40 | (this.nes.player(n).get_joypad_state() & 1);
    var j = new Uint8Array(1);
    j[0] = 0x40 | (joypad_bits[n] & 1);
    joypad_bits[n] = 0x80 | (joypad_bits[n]  >> 1);
    return j[0];
}

Joypad.prototype.write_strobe = function(v){
    if (strobe && !v){
        for (var i = 0; i < 2; i++){
            joypad_bits[i] = this.nes.player(i).get_joypad_state();
        }
    }
    strobe = v;
}

module.exports = Joypad