// BeamSpec type definition
export type BeamSpec = {
  id: string;
  width: number;
  depth: number;
  topBarSize: number | null;
  topBarQty: number;
  webBarSize: number | null;
  webBarQty: number;
  bottomBarSize: number | null;
  bottomBarQty: number;
  stirrupSize: number | null;
  stirrupQty: number;
};

// ColumnSpec type definition
export type ColumnSpec = {
  id: string;
  width: number;
  depth: number;
  height: number; // floor-to-floor height
  mainBarSize: number;
  mainBarQty: number;
  tieSize: number;
  tieSpacing: number; // spacing in meters
};

// Multi-floor data structures
export type StructuralSystem = {
  numCols: number;
  numRows: number;
  cols: Array<{ label: string; position: number }>;
  rows: Array<{ label: string; position: number }>;
};

export type Floor = {
  id: string;
  level: number;
  name: string;
  structuralSystem: StructuralSystem;
  beamSpecs: BeamSpec[];
  columnSpecs: ColumnSpec[];
  colBeamIds: string[];
  rowBeamIds: string[];
  columnIds: string[]; // grid intersection assignments
  inheritsStructural: boolean;
};

export type Building = {
  id: string;
  name: string;
  floors: Floor[];
};

export type BuildingSummary = {
  totalConcreteVolume: number;
  totalGrade40Steel: number;
  totalGrade60Steel: number;
  floorBreakdown: {
    floorId: string;
    floorName: string;
    concreteVolume: number;
    grade40Steel: number;
    grade60Steel: number;
    beamBreakdown: {
      beamId: string;
      segments: string[];
      totalLength: number;
      concreteVolume: number;
      grade40Steel: number;
      grade60Steel: number;
    }[];
    columnBreakdown: {
      columnId: string;
      locations: string[];
      count: number;
      concreteVolume: number;
      grade40Steel: number;
      grade60Steel: number;
    }[];
  }[];
};

// Constants
export const BAR_SIZES = [8, 10, 12, 16, 20, 25, 32];

// Standard reinforcement bar weights (kg/m) based on steel density 7850 kg/m³
export const BAR_WEIGHTS: { [key: number]: number } = {
  8: 0.395,   // 8mm = 0.395 kg/m
  10: 0.617,  // 10mm = 0.617 kg/m
  12: 0.888,  // 12mm = 0.888 kg/m
  16: 1.578,  // 16mm = 1.578 kg/m
  20: 2.466,  // 20mm = 2.466 kg/m
  25: 3.853,  // 25mm = 3.853 kg/m
  32: 6.313   // 32mm = 6.313 kg/m
};