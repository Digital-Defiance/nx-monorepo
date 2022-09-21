//B3. Galois Header File 
#ifndef GALOIS_H 
#define GALOIS_H 
#include <iostream> 
#include <fstream> 
#include <stdint.h>  
#include <stdlib.h> 
#include <math.h> 
/*uint8_t key[16] = 
{0x00,0x08,0x10,0x18,0x20,0x28,0x30,0x38,0x40,0x48,0x50,0x58,0x60,0x68,0x70,0x7
8}; 
uint8_t state[16]; */ 
using namespace std; 
class galois 
{ 
public: 
 uint8_t gmulInverse(uint8_t in); 
 unsigned char sbox(unsigned char in, char * key); 
// void sub_bytes(char streamLetter, unsigned char *key) 
 
 uint8_t gadd(uint8_t a, uint8_t b); 
 uint8_t gsub(uint8_t a, uint8_t b); 
 uint8_t gmul(uint8_t a, uint8_t b); 
 uint8_t gmulLookup(uint8_t a, uint8_t b); 
 uint8_t gdiv(uint8_t a, uint8_t b); 
 void generateGmulInverse(); 
}; 
#endif 