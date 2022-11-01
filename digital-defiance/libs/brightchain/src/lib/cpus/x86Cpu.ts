// https://gist.githubusercontent.com/tadeuzagallo/3853299f033bf9b746e4/raw/43467ba1bee7251e1b653123f29e6ff5643a0735/x86.js
// https://gist.github.com/tadeuzagallo/3853299f033bf9b746e4
'use strict';
import RegisterName from './registers';
import {
  X83Instructions,
  fn0x81Instructions,
  fn0x0fInstructions,
  syscallInstructions,
  buildInstructionArray,
} from './instructionTables';

export class X86Cpu {
  public NG = false;
  public NZ = false;

  public static readonly StackSize = 1024;
  public static readonly RegisterCount = 8;

  public readonly Interrupts: Map<number, () => void> = new Map<
    number,
    () => void
  >();
  public readonly Program: Uint32Array;
  public readonly Registers: Uint32Array;
  public PC: number;
  public Instructions: Array<() => void>;
  public Syscalls: Map<number, () => void>;
  public x83Instructions: Map<number, (reg: number, op2: number) => void>;
  public fn0x81Instructions: Map<number, (reg: number, value?: number) => void>;
  public fn0x0fInstructions: Map<number, () => void>;

  constructor(
    memory: ArrayBuffer | Uint32Array | number,
    registers: number | Uint32Array,
    pc: number
  ) {
    if (memory instanceof Uint32Array) {
      this.Program = memory;
    } else if (memory instanceof ArrayBuffer) {
      // uint32 array from arraybuffer
      this.Program = new Uint32Array(memory);
    } else {
      // number of bytes
      this.Program = new Uint32Array(memory);
    }
    if (registers instanceof Uint32Array) {
      this.Registers = new Uint32Array(registers);
    } else {
      // number of registers
      this.Registers = new Uint32Array(registers);
    }
    this.PC = pc;
    this.Instructions = buildInstructionArray(this);
    this.Syscalls = syscallInstructions(this);
    this.x83Instructions = X83Instructions(this);
    this.fn0x81Instructions = fn0x81Instructions(this);
    this.fn0x0fInstructions = fn0x0fInstructions(this);
  }
  public readonly Stack = new Uint32Array(X86Cpu.StackSize);

  public read(size: number) {
    let value;
    switch (size) {
      case 1:
        value = this.Program[this.PC];
        break;
      case 2:
        value = (this.Program[this.PC + 1] << 8) | this.Program[this.PC];
        break;
      case 4:
        value =
          (this.Program[this.PC + 3] << 24) |
          (this.Program[this.PC + 2] << 16) |
          (this.Program[this.PC + 1] << 8) |
          this.Program[this.PC];
        break;
      case -1:
        // http://blog.vjeux.com/2013/javascript/conversion-from-uint8-to-int8-x-24.html
        value = (this.Program[this.PC] << 24) >> 24;
        break;
      default:
        throw new Error('Invalid read size');
    }
    this.PC += Math.abs(size); // & 127; // abs
    return value;
  }

  public pop() {
    return this.Stack[this.Registers[RegisterName.ESP]++];
  }

  public push(value: number): void {
    this.Stack[--this.Registers[RegisterName.ESP]] = value;
  }

  public static run(
    memory: number | Uint32Array | ArrayBuffer,
    registers: number | Uint32Array,
    pc: number
  ): X86Cpu {
    const cpu = new X86Cpu(memory, registers, pc);
    cpu.Registers[RegisterName.ESP] = 1023;
    let op;
    while (cpu.PC !== -1 && (op = cpu.read(1))) {
      cpu.Instructions[op]();
    }
    return cpu;
  }
}
