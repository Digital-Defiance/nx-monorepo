import { X86Cpu } from './x86Cpu';
import { RegisterName } from './registers';
import * as instructions from './instructions';

export enum InstructionOpcode {
  // fn0x0f
  fn0x0f = 0x0f,
  // mov imm8 reg
  movImm8RegEAX = 0xb8,
  movImm8RegECX = 0xb9,
  movImm8RegEDX = 0xba,
  movImm8RegEBX = 0xbb,
  movImm8RegESP = 0xbc,
  // dec reg
  decEAX = 0x48,
  decECX = 0x49,
  decEDX = 0x4a,
  decEBX = 0x4b,
  decESP = 0x4c,
  decEBP = 0x4d,
  decESI = 0x4e,
  decEDI = 0x4f,
  // push reg
  pushEAX = 0x50,
  pushECX = 0x51,
  pushEDX = 0x52,
  pushEBX = 0x53,
  pushESP = 0x54,
  pushEBP = 0x55,
  pushESI = 0x56,
  pushEDI = 0x57,
  // pop reg
  popEAX = 0x58,
  popECX = 0x59,
  popEDX = 0x5a,
  popEBX = 0x5b,
  popESP = 0x5c,
  popEBP = 0x5d,
  popESI = 0x5e,
  popEDI = 0x5f,
  pushImm8 = 0x6a,
  movRegReg = 0x89,
  yam = 0x8b,
  ret = 0xc3,
  movl = 0xc7,
  lea = 0x8d,
  addReg = 0x01,
  addRegPad = 0x03,
  addEAX = 0x05,
  subRAX = 0x2d,
  jge = 0x7d,
  x81 = 0x81,
  x83 = 0x83,
  int = 0xcd,
  call = 0xe8,
  jmpImm8 = 0xeb,
}

export function Instructions(cpu: X86Cpu): Map<number, () => void> {
  return new Map<number, () => void>([
    [InstructionOpcode.fn0x0f, instructions.invokeFn0x0f(cpu)],
    [InstructionOpcode.movImm8RegEAX, instructions.mov(cpu, RegisterName.EAX)],
    [InstructionOpcode.movImm8RegECX, instructions.mov(cpu, RegisterName.ECX)],
    [InstructionOpcode.movImm8RegEDX, instructions.mov(cpu, RegisterName.EDX)],
    [InstructionOpcode.movImm8RegEBX, instructions.mov(cpu, RegisterName.EBX)],
    [InstructionOpcode.movImm8RegESP, instructions.mov(cpu, RegisterName.ESP)],
    [InstructionOpcode.decEAX, instructions.dec(cpu, RegisterName.EAX)],
    [InstructionOpcode.decECX, instructions.dec(cpu, RegisterName.ECX)],
    [InstructionOpcode.decEDX, instructions.dec(cpu, RegisterName.EDX)],
    [InstructionOpcode.decEBX, instructions.dec(cpu, RegisterName.EBX)],
    [InstructionOpcode.decESP, instructions.dec(cpu, RegisterName.ESP)],
    [InstructionOpcode.decEBP, instructions.dec(cpu, RegisterName.EBP)],
    [InstructionOpcode.decESI, instructions.dec(cpu, RegisterName.ESI)],
    [InstructionOpcode.decEDI, instructions.dec(cpu, RegisterName.EDI)],
    [InstructionOpcode.pushEAX, instructions.pushr(cpu, RegisterName.EAX)],
    [InstructionOpcode.pushECX, instructions.pushr(cpu, RegisterName.ECX)],
    [InstructionOpcode.pushEDX, instructions.pushr(cpu, RegisterName.EDX)],
    [InstructionOpcode.pushEBX, instructions.pushr(cpu, RegisterName.EBX)],
    [InstructionOpcode.pushESP, instructions.pushr(cpu, RegisterName.ESP)],
    [InstructionOpcode.pushEBP, instructions.pushr(cpu, RegisterName.EBP)],
    [InstructionOpcode.pushESI, instructions.pushr(cpu, RegisterName.ESI)],
    [InstructionOpcode.pushEDI, instructions.pushr(cpu, RegisterName.EDI)],
    [InstructionOpcode.popEAX, instructions.popr(cpu, RegisterName.EAX)],
    [InstructionOpcode.popECX, instructions.popr(cpu, RegisterName.ECX)],
    [InstructionOpcode.popEDX, instructions.popr(cpu, RegisterName.EDX)],
    [InstructionOpcode.popEBX, instructions.popr(cpu, RegisterName.EBX)],
    [InstructionOpcode.popESP, instructions.popr(cpu, RegisterName.ESP)],
    [InstructionOpcode.popEBP, instructions.popr(cpu, RegisterName.EBP)],
    [InstructionOpcode.popESI, instructions.popr(cpu, RegisterName.ESI)],
    [InstructionOpcode.popEDI, instructions.popr(cpu, RegisterName.EDI)],
    [InstructionOpcode.pushImm8, instructions.pushi(cpu)],
    [InstructionOpcode.movRegReg, instructions.movRegReg(cpu)],
    [InstructionOpcode.yam, instructions.yam(cpu)],
    [InstructionOpcode.ret, instructions.ret(cpu)],
    [InstructionOpcode.movl, instructions.movl(cpu)],
    [InstructionOpcode.lea, instructions.lea(cpu)],
    [InstructionOpcode.addReg, instructions.addReg(cpu)],
    [InstructionOpcode.addRegPad, instructions.addRegPad(cpu)],
    [InstructionOpcode.addEAX, instructions.addEAX(cpu)],
    [InstructionOpcode.subRAX, instructions.subRAX(cpu)],
    [InstructionOpcode.jge, instructions.jge(cpu)],
    [InstructionOpcode.x81, instructions.invokeX81(cpu)],
    [InstructionOpcode.x83, instructions.invokeX83(cpu)],
    [InstructionOpcode.int, instructions.int(cpu)],
    [InstructionOpcode.call, instructions.call(cpu)],
    [InstructionOpcode.jmpImm8, instructions.jmpImm8(cpu)],
  ]);
}

export function buildInstructionArray(cpu: X86Cpu): Array<() => void> {
  const instructionList = Instructions(cpu);
  const instructionArray = new Array<() => void>(0xff);
  for (let i = 0; i < instructionArray.length; i++) {
    instructionArray[i] = instructions.noOp(cpu);
  }
  instructionList.forEach((value, key) => {
    instructionArray[key] = value;
  });
  return instructionArray;
}

export function X83Instructions(
  cpu: X86Cpu
): Map<number, (reg: number, op2: number) => void> {
  return new Map<number, (reg: number, op2: number) => void>([
    // add
    [0x00, instructions.x83Add(cpu)],

    // sub
    [0x05, instructions.x83Sub(cpu)],

    // cmp
    [0x07, instructions.x83Cmp(cpu)],
  ]);
}

export function fn0x81Instructions(
  cpu: X86Cpu
): Map<number, (reg: number, value?: number) => void> {
  return new Map<number, (reg: number, value?: number) => void>([
    // sub
    [0x05, instructions.invokeX81_05Sub(cpu)],

    // cmpl
    [0x07, instructions.invokeX81_07Cmp(cpu)],
  ]);
}

export function syscallInstructions(cpu: X86Cpu): Map<number, () => void> {
  return new Map<number, () => void>([
    [0x1, instructions.sysCallExit(cpu)],
    [0x80, instructions.sysCallInterrupt(cpu)],
  ]);
}

// Prefix 0x0F
export function fn0x0fInstructions(cpu: X86Cpu): Map<number, () => void> {
  return new Map<number, () => void>([
    // jge
    [0x8d, instructions.fn0x0f8dJge(cpu)],

    // jle short jump
    [0x8e, instructions.fn0x0f8eJle(cpu)],

    // imul
    [0xaf, instructions.fn0x0fAfImul(cpu)],

    // noop
    [0x1f, instructions.noOp(cpu)],
  ]);
}

export function getSysCallInstruction(cpu: X86Cpu, opcode: number): () => void {
  const instruction = cpu.Syscalls.get(opcode);
  if (instruction === undefined) {
    throw new Error('Invalid opcode');
  }
  return instruction;
}

export function getInterruptInstruction(
  cpu: X86Cpu,
  opcode: number
): () => void {
  const instruction = cpu.Interrupts.get(opcode);
  if (instruction === undefined) {
    throw new Error('Invalid opcode');
  }
  return instruction;
}

export function getFn0x0fInstruction(cpu: X86Cpu, opcode: number): () => void {
  const instruction = cpu.fn0x0fInstructions.get(opcode);
  if (instruction === undefined) {
    throw new Error('Invalid opcode');
  }
  return instruction;
}

export function getFn0x81Instruction(
  cpu: X86Cpu,
  opcode: number
): (reg: number, value?: number) => void {
  const instruction = cpu.fn0x81Instructions.get(opcode);
  if (instruction === undefined) {
    throw new Error('Invalid opcode');
  }
  return instruction;
}

export function getX83Instruction(
  cpu: X86Cpu,
  opcode: number
): (reg: number, op2: number) => void {
  const instruction = cpu.x83Instructions.get(opcode);
  if (instruction === undefined) {
    throw new Error('Invalid opcode');
  }
  return instruction;
}
