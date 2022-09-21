// mostly from:
// - https://quantum-flytrap.github.io/quantum-tensors/modules/Gates.html
// - https://quantum-flytrap.github.io/quantum-tensors/modules/Ops.html

export enum StargateOperationType
{
    NoOperation = 'NO_OP',
    Zero = 'ZERO', // set all energies to zero
    QuantumCCX = 'QUANTUM_CCX',
    QuantumCSwap = 'QUANTUM_CSWAP',
    QuantumCX = 'QUANTUM_CX',
    QuantumCZ = 'QUANTUM_CZ',
    QuantumH = 'QUANTUM_H',
    QuantumI = 'QUANTUM_I',
    QuantumS = 'QUANTUM_S',
    QuantumSwap = 'QUANTUM_SWAP',
    QuantumT = 'QUANTUM_T',
    QuantumX = 'QUANTUM_X',
    QuantumY = 'QUANTUM_Y',
    QuantumZ = 'QUANTUM_Z',
}

export default StargateOperationType;