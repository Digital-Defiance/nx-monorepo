//B1. MD5 Header File 
#ifndef MD5_H 
#define MD5_H 
#include <stdio.h> 
#include <string.h> 
typedef struct { 
 unsigned char data[64]; 
 unsigned int datalen; 
 unsigned int bitlen[2]; 
 unsigned int state[4]; 
} MD5_CTX; 
void print_hash(char hash[]); 
void md5_transform(MD5_CTX *ctx, unsigned char data[]); 
void md5_init(MD5_CTX *ctx); 
void md5_update(MD5_CTX *ctx, unsigned char data[], unsigned int len); 
void md5_final(MD5_CTX *ctx, unsigned char hash[]); 
#endif 