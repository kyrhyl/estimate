import { Building } from './types';

export const defaultBuilding: Building = {
  id: "building-1",
  name: "Building 1",
  footingSpecs: [
    { id: "F1", type: "isolated", width: 1.5, length: 1.5, depth: 1.2, mainBarSize: 16, mainBarSpacing: 150, distributionBarSize: 12, distributionBarSpacing: 200, stirrupSize: 8, stirrupSpacing: 0.15, topBarsRequired: false },
    { id: "F2", type: "combined", width: 2.0, length: 2.0, depth: 1.5, mainBarSize: 20, mainBarSpacing: 125, distributionBarSize: 16, distributionBarSpacing: 150, stirrupSize: 10, stirrupSpacing: 0.12, topBarsRequired: false },
  ],
  footingAssignments: [],
  floors: [
    {
      id: "floor-1",
      level: 1,
      name: "Ground Floor",
      structuralSystem: {
        numCols: 4,
        numRows: 3,
        cols: [
          { label: "1", position: 0 },
          { label: "2", position: 5 },
          { label: "3", position: 10 },
          { label: "4", position: 15 },
        ],
        rows: [
          { label: "A", position: 0 },
          { label: "B", position: 4 },
          { label: "C", position: 8 },
        ],
      },
      beamSpecs: [
        { id: "B1", width: 0.3, depth: 0.5, topBarSize: 12, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 12, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 },
        { id: "B2", width: 0.3, depth: 0.6, topBarSize: 12, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 12, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 8 },
        { id: "B3", width: 0.25, depth: 0.4, topBarSize: 10, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 10, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 },
      ],
      columnSpecs: [
        { id: "C1", width: 0.4, depth: 0.4, height: 3.0, mainBarSize: 16, mainBarQty: 8, tieSize: 10, tieSpacing: 0.15 },
        { id: "C2", width: 0.5, depth: 0.5, height: 3.0, mainBarSize: 20, mainBarQty: 12, tieSize: 10, tieSpacing: 0.15 },
        { id: "C3", width: 0.3, depth: 0.3, height: 3.0, mainBarSize: 12, mainBarQty: 6, tieSize: 8, tieSpacing: 0.2 },
      ],
      slabSpecs: [
        { id: "S1", thickness: 125, type: "two-way", mainBarSize: 12, mainBarSpacing: 150, distributionBarSize: 8, distributionBarSpacing: 250, temperatureBarSize: 8, temperatureBarSpacing: 150, topBarSize: null, topBarSpacing: null },
      ],
      slabAssignments: [],
      colBeamIds: Array(3 * 3).fill(""),
      rowBeamIds: Array(4 * 2).fill(""),
      columnIds: Array(4 * 3).fill(""), // grid intersections
      inheritsStructural: false,
    },
  ],
};