#include <stdio.h>
#include <iostream>
#include <emscripten.h>



void EMSCRIPTEN_KEEPALIVE test(){
  std::cout << "Hello World!" << std::endl;
}