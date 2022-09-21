export enum SuppliedPartType {
  Unknown = -1,
  RotorA = 0,
  RotorB = 1,
  RotorC = 2,
  RotorD = 4,
  RotorE = 8,
  ReflectorA = 16,
  PlugboardA = 32,
}

export const SuppliedPartTypes = [
  SuppliedPartType.PlugboardA,
  SuppliedPartType.RotorA,
  SuppliedPartType.RotorB,
  SuppliedPartType.RotorC,
  SuppliedPartType.RotorD,
  SuppliedPartType.RotorE,
  SuppliedPartType.ReflectorA,
];

export default SuppliedPartType;
