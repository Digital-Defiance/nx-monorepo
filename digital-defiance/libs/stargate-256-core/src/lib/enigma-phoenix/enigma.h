//B5. Enigma Header File 
#ifndef ENIGMA_H 
#define ENIGMA_H 
//#include "galois.h" 
#include <stdio.h> 
#include <stdlib.h> 
#include <ctype.h> 
//#include <iostream.h> 
#include <string.h> 
#include <math.h> 
#include <fstream> 
#include <cstdio> 
#include <stdint.h> 
#include <sys/stat.h> 
#include <iostream> 
#include <vector> 
#include "md5.h" 
#include "galois.h" 

//uses 128 bit key 
using namespace std; 
/*typedef struct ListStruct { 
 int val; 
 struct ListStruct * ptr; 
} List;*/ 
//int delete_list_entry(List * list, int entry); 
class enigma 
{ 
 public: 
 enigma(); 
 ~enigma(); 
 int file_do_cipher(char * infile, char * outfile, char * key); 
 
 private: 
 int FileSize(const char* sFileName); 
 char char_do_enigma(uint8_t x); 
 void init_enigma(char * key); 
 void audit_rotors(int currPosition); 
 uint8_t rotor_lookup(uint8_t x, int rotor); 
 
 int num_rotors; 
 uint8_t ** rotors; 
 uint8_t ** rotors_r; 
 int * position; 
 
 int reflector[256]; 
 int plugboard[256]; 
}; 
#endif 