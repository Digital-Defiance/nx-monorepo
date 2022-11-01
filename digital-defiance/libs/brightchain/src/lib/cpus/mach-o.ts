// https://gist.githubusercontent.com/tadeuzagallo/3853299f033bf9b746e4/raw/43467ba1bee7251e1b653123f29e6ff5643a0735/mach-o.js
// https://gist.github.com/tadeuzagallo/3853299f033bf9b746e4
'use strict';

import RegisterName from './registers';
import { X86Cpu } from './x86Cpu';

const LC_SEGMENT = 0x00000001;
const LC_UNIXTHREAD = 0x00000005;

const Memory = new ArrayBuffer(1048576);
const Registers = new Uint32Array(8);
let PC = -1;

export function loadBinary(file: Blob) {
  const reader = new FileReader();
  reader.addEventListener('loadend', function () {
    if (typeof reader.result == 'string' || reader.result == null) {
      throw new Error('Invalid Mach-O file');
    } else {
      readBinary(Buffer.from(reader.result));
    }
  });
  reader.readAsArrayBuffer(file);
}

export function readBinary(buffer: Buffer): X86Cpu {
  const header = buffer.subarray(0, 7);
  if (header[0] !== 0xfeedface) {
    throw new Error('Invalid Mach magic');
  }
  // var cpuType = header[1];
  // var cpuSubtype = header[2];
  // var fileType = header[3];
  const numCommands = header[4];
  // var commandsSize = header[5];
  // var flags = header[6];
  let currentCommandStart = 7;
  for (let i = 0; i < numCommands; i++) {
    const commandSize = buffer[currentCommandStart + 1];
    const commandEnd = currentCommandStart + commandSize / 4;
    const commandBuffer = buffer.subarray(currentCommandStart, commandEnd);

    handleCommand(buffer, commandBuffer);

    currentCommandStart = commandEnd;
  }
  if (PC !== -1) {
    const cpu = X86Cpu.run(Memory, Registers, PC);
    return cpu;
  }
  PC = -1;
  throw new Error('Invalid Mach-O file');
}

export function handleCommand(buffer: Buffer, commandBuffer: Buffer) {
  const command = commandBuffer[0];
  switch (command) {
    case LC_SEGMENT:
      handleSegmentCommand(buffer, commandBuffer);
      break;
    case LC_UNIXTHREAD:
      handleUnixThreadCommand(buffer, commandBuffer);
      break;
    default:
    // Unhandled command
  }
}

export function handleSegmentCommand(buffer: Buffer, commandBuffer: Buffer) {
  const vmAddress = commandBuffer[6] >> 2;
  const vmSize = commandBuffer[7] >> 2;
  const fileOffset = commandBuffer[8] >> 2;
  const fileSize = commandBuffer[9] >> 2;
  const fileEnd = fileOffset + fileSize;

  const view = new Uint32Array(Memory);

  for (let i = 0; i < vmSize; i++) {
    if (fileOffset + i >= fileEnd) {
      break;
    }
    view[vmAddress + i] = buffer[fileOffset + i];
  }
}

export function handleUnixThreadCommand(buffer: Buffer, commandBuffer: Buffer) {
  const offset = 4;
  Registers[RegisterName.EAX] = commandBuffer[offset + 0]; // eax
  Registers[RegisterName.ECX] = commandBuffer[offset + 2]; // ecx
  Registers[RegisterName.EDX] = commandBuffer[offset + 3]; // edx
  Registers[RegisterName.EBX] = commandBuffer[offset + 1]; // ebx
  Registers[RegisterName.ESP] = commandBuffer[offset + 7]; // esp
  Registers[RegisterName.EBP] = commandBuffer[offset + 6]; // ebp
  Registers[RegisterName.ESI] = commandBuffer[offset + 5]; // esi
  Registers[RegisterName.EDI] = commandBuffer[offset + 4]; // edi
  //var ss = commandBuffer[offset + 8];
  //var eflags = commandBuffer[offset + 9];
  PC = commandBuffer[offset + 10];
  //var cs = commandBuffer[offset + 11];
  //var ds = commandBuffer[offset + 12];
  //var es = commandBuffer[offset + 13];
  //var fs = commandBuffer[offset + 14];
  //var gs = commandBuffer[offset + 15];
}
