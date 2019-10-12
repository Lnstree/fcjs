function Player(nes){
    this.nes = nes;
    this.key_up   = 0;
    this.key_down = 0;
    this.key_left = 0;
    this.key_right = 0;
    this.key_select = 0;
    this.key_start = 0;
    this.key_a = 0;
    this.key_b = 0;
}


Player.prototype.press = function(index){
    switch (index) {
        case 1:
            this.key_up = 1;
            break;
        case 2:
            this.key_down = 1;
            break;
        case 3:
            this.key_left = 1;
            break;
        case 4:
            this.key_right = 1;
            break;
        case 5:
            this.key_select = 1;
            break;
        case 6:
            this.key_start = 1;
            break;
        case 7:
            this.key_a = 1;
            break;
        case 8:
            this.key_b = 1;
            break;
    }
}

Player.prototype.release = function(index){
    switch (index) {
        case 1:
            this.key_up = 0;
            break;
        case 2:
            this.key_down = 0;
            break;
        case 3:
            this.key_left = 0;
            break;
        case 4:
            this.key_right = 0;
            break;
        case 5:
            this.key_select = 0;
            break;
        case 6:
            this.key_start = 0;
            break;
        case 7:
            this.key_a = 0;
            break;
        case 8:
            this.key_b = 0;
            break;
    }
}

Player.prototype.get_joypad_state = function(){
    var j = new Uint8Array(1);
    j[0] |= this.key_a << 0;
    j[0] |= this.key_b << 1;
    j[0] |= this.key_select << 2;
    j[0] |= this.key_start  << 3;
    j[0] |= this.key_up     << 4;
    j[0] |= this.key_down   << 5;
    j[0] |= this.key_left   << 6;
    j[0] |= this.key_right  << 7;
    return j[0];
}

module.exports = Player