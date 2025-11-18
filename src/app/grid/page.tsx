"use client";
import { useState } from "react";

// BeamSpec type definition
type BeamSpec = {
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

// Multi-floor data structures
type GridSystem = {
  numCols: number;
  numRows: number;
  cols: Array<{ label: string; position: number }>;
  rows: Array<{ label: string; position: number }>;
};

type Floor = {
  id: string;
  level: number;
  name: string;
  gridSystem: GridSystem;
  beamSpecs: BeamSpec[];
  colBeamIds: string[];
  rowBeamIds: string[];
  inheritsGrid: boolean;
};

type Building = {
  id: string;
  name: string;
  floors: Floor[];
};

type BuildingSummary = {
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
  }[];
};

export default function GridPage() {
  const [currentFloorId, setCurrentFloorId] = useState("floor-1");
  const [activeTab, setActiveTab] = useState<'beams' | 'grid' | 'summary'>('beams');

  // Multi-floor state management
  const [building, setBuilding] = useState<Building>({
    id: "building-1",
    name: "Building 1",
    floors: [
      {
        id: "floor-1",
        level: 1,
        name: "Ground Floor",
        gridSystem: {
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
        colBeamIds: Array(3 * 3).fill(""),
        rowBeamIds: Array(4 * 2).fill(""),
        inheritsGrid: false,
      },
    ],
  });

  // Current floor computed values
  const currentFloor = building.floors.find((f: Floor) => f.id === currentFloorId) || building.floors[0];
  const numCols = currentFloor.gridSystem.numCols;
  const numRows = currentFloor.gridSystem.numRows;
  const cols = currentFloor.gridSystem.cols;
  const rows = currentFloor.gridSystem.rows;
  const beamSpecs = currentFloor.beamSpecs;
  const colBeamIds = currentFloor.colBeamIds;
  const rowBeamIds = currentFloor.rowBeamIds;

  // Floor management functions
  const addFloor = () => {
    const newFloorLevel = building.floors.length + 1;
    const newFloor: Floor = {
      id: `floor-${newFloorLevel}`,
      level: newFloorLevel,
      name: `Floor ${newFloorLevel}`,
      gridSystem: {
        ...building.floors[0].gridSystem, // Inherit from ground floor
      },
      beamSpecs: [...building.floors[0].beamSpecs], // Copy beam specs
      colBeamIds: Array(building.floors[0].gridSystem.numRows * (building.floors[0].gridSystem.numCols - 1)).fill(""),
      rowBeamIds: Array(building.floors[0].gridSystem.numCols * (building.floors[0].gridSystem.numRows - 1)).fill(""),
      inheritsGrid: true,
    };

    setBuilding((prev: Building) => ({
      ...prev,
      floors: [...prev.floors, newFloor],
    }));
    setCurrentFloorId(newFloor.id);
  };

  const deleteFloor = (floorId: string) => {
    if (building.floors.length <= 1) return; // Don't allow deleting the last floor
    
    setBuilding((prev: Building) => ({
      ...prev,
      floors: prev.floors.filter((f: Floor) => f.id !== floorId),
    }));
    
    if (currentFloorId === floorId) {
      setCurrentFloorId(building.floors[0].id);
    }
  };

  const updateCurrentFloor = (updates: Partial<Floor>) => {
    setBuilding((prev: Building) => ({
      ...prev,
      floors: prev.floors.map((f: Floor) => 
        f.id === currentFloorId ? { ...f, ...updates } : f
      ),
    }));
  };

  // Updated grid handlers to work with current floor
  const handleNumColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value));
    const updatedCols = [...currentFloor.gridSystem.cols];
    while (updatedCols.length < value) {
      updatedCols.push({ label: String(updatedCols.length + 1), position: updatedCols.length * 5 });
    }
    const finalCols = updatedCols.slice(0, value);
    
    updateCurrentFloor({
      gridSystem: {
        ...currentFloor.gridSystem,
        numCols: value,
        cols: finalCols,
      },
      colBeamIds: Array(numRows * (value - 1)).fill(""),
    });
  };

  const handleNumRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value));
    const updatedRows = [...currentFloor.gridSystem.rows];
    while (updatedRows.length < value) {
      updatedRows.push({ label: String.fromCharCode(65 + updatedRows.length), position: updatedRows.length * 4 });
    }
    const finalRows = updatedRows.slice(0, value);
    
    updateCurrentFloor({
      gridSystem: {
        ...currentFloor.gridSystem,
        numRows: value,
        rows: finalRows,
      },
      rowBeamIds: Array(numCols * (value - 1)).fill(""),
    });
  };

  const setBeamSpecs = (newSpecs: BeamSpec[]) => {
    updateCurrentFloor({ beamSpecs: newSpecs });
  };

  const setColBeamIds = (newIds: string[]) => {
    updateCurrentFloor({ colBeamIds: newIds });
  };

  const setRowBeamIds = (newIds: string[]) => {
    updateCurrentFloor({ rowBeamIds: newIds });
  };

  const setCols = (newCols: Array<{ label: string; position: number }>) => {
    updateCurrentFloor({
      gridSystem: {
        ...currentFloor.gridSystem,
        cols: newCols,
      },
    });
  };

  const setRows = (newRows: Array<{ label: string; position: number }>) => {
    updateCurrentFloor({
      gridSystem: {
        ...currentFloor.gridSystem,
        rows: newRows,
      },
    });
  };
  const BAR_SIZES = [8, 10, 12, 16, 20, 25, 32];
  
  // Standard reinforcement bar weights (kg/m) based on steel density 7850 kg/m³
  const BAR_WEIGHTS: { [key: number]: number } = {
    8: 0.395,   // 8mm = 0.395 kg/m
    10: 0.617,  // 10mm = 0.617 kg/m
    12: 0.888,  // 12mm = 0.888 kg/m
    16: 1.578,  // 16mm = 1.578 kg/m
    20: 2.466,  // 20mm = 2.466 kg/m
    25: 3.853,  // 25mm = 3.853 kg/m
    32: 6.313   // 32mm = 6.313 kg/m
  };

  // Calculate reinforcement weights per meter for a beam
  const calculateReinforcementWeights = (beam: BeamSpec): { grade40Weight: number; grade60Weight: number; totalWeight: number } => {
    let grade40Weight = 0; // < 16mm
    let grade60Weight = 0; // >= 16mm
    
    // Top bars
    if (beam.topBarSize && beam.topBarQty > 0) {
      const weight = BAR_WEIGHTS[beam.topBarSize] * beam.topBarQty;
      if (beam.topBarSize < 16) {
        grade40Weight += weight;
      } else {
        grade60Weight += weight;
      }
    }
    
    // Web bars
    if (beam.webBarSize && beam.webBarQty > 0) {
      const weight = BAR_WEIGHTS[beam.webBarSize] * beam.webBarQty;
      if (beam.webBarSize < 16) {
        grade40Weight += weight;
      } else {
        grade60Weight += weight;
      }
    }
    
    // Bottom bars
    if (beam.bottomBarSize && beam.bottomBarQty > 0) {
      const weight = BAR_WEIGHTS[beam.bottomBarSize] * beam.bottomBarQty;
      if (beam.bottomBarSize < 16) {
        grade40Weight += weight;
      } else {
        grade60Weight += weight;
      }
    }
    
    // Stirrups - perimeter calculation
    if (beam.stirrupSize && beam.stirrupQty > 0) {
      const perimeter = 2 * (beam.width + beam.depth); // beam perimeter in meters
      const stirrupLength = perimeter * beam.stirrupQty; // total stirrup length per meter of beam
      const weight = BAR_WEIGHTS[beam.stirrupSize] * stirrupLength;
      if (beam.stirrupSize < 16) {
        grade40Weight += weight;
      } else {
        grade60Weight += weight;
      }
    }
    
    return { grade40Weight, grade60Weight, totalWeight: grade40Weight + grade60Weight };
  };

  // Calculate building summary across all floors
  const calculateBuildingSummary = (): BuildingSummary => {
    let totalConcreteVolume = 0;
    let totalGrade40Steel = 0;
    let totalGrade60Steel = 0;
    const floorBreakdown: BuildingSummary['floorBreakdown'] = [];

    building.floors.forEach(floor => {
      // Calculate beam summary for this floor
      const beamSummaryMap = new Map();
      
      // Column lengths (X direction)
      const colLengths = [];
      for (let r = 0; r < floor.gridSystem.numRows; r++) {
        for (let c = 0; c < floor.gridSystem.numCols - 1; c++) {
          const from = floor.gridSystem.cols[c];
          const to = floor.gridSystem.cols[c + 1];
          const length = Math.abs(to.position - from.position);
          const beamIdIndex = r * (floor.gridSystem.numCols - 1) + c;
          const beamId = floor.colBeamIds[beamIdIndex];
          if (beamId) {
            colLengths.push({ beamId, length, segment: `${floor.gridSystem.rows[r].label}${from.label}-${floor.gridSystem.rows[r].label}${to.label}` });
          }
        }
      }
      
      // Row lengths (Y direction)
      const rowLengths = [];
      for (let c = 0; c < floor.gridSystem.numCols; c++) {
        for (let r = 0; r < floor.gridSystem.numRows - 1; r++) {
          const from = floor.gridSystem.rows[r];
          const to = floor.gridSystem.rows[r + 1];
          const length = Math.abs(to.position - from.position);
          const beamIdIndex = c * (floor.gridSystem.numRows - 1) + r;
          const beamId = floor.rowBeamIds[beamIdIndex];
          if (beamId) {
            rowLengths.push({ beamId, length, segment: `${from.label}${floor.gridSystem.cols[c].label}-${to.label}${floor.gridSystem.cols[c].label}` });
          }
        }
      }
      
      // Aggregate beam data
      [...colLengths, ...rowLengths].forEach(({ beamId, length, segment }) => {
        if (!beamSummaryMap.has(beamId)) {
          beamSummaryMap.set(beamId, { segments: [], totalLength: 0 });
        }
        const summary = beamSummaryMap.get(beamId);
        summary.segments.push(segment);
        summary.totalLength += length;
      });
      
      // Calculate floor totals
      let floorConcreteVolume = 0;
      let floorGrade40Steel = 0;
      let floorGrade60Steel = 0;
      const beamBreakdown: BuildingSummary['floorBreakdown'][0]['beamBreakdown'] = [];
      
      beamSummaryMap.forEach((summary, beamId) => {
        const beam = floor.beamSpecs.find(b => b.id === beamId);
        if (beam) {
          const beamConcreteVolume = summary.totalLength * beam.width * beam.depth;
          const weights = calculateReinforcementWeights(beam);
          const beamGrade40Steel = weights.grade40Weight * summary.totalLength;
          const beamGrade60Steel = weights.grade60Weight * summary.totalLength;
          
          floorConcreteVolume += beamConcreteVolume;
          floorGrade40Steel += beamGrade40Steel;
          floorGrade60Steel += beamGrade60Steel;
          
          beamBreakdown.push({
            beamId,
            segments: summary.segments,
            totalLength: summary.totalLength,
            concreteVolume: beamConcreteVolume,
            grade40Steel: beamGrade40Steel,
            grade60Steel: beamGrade60Steel,
          });
        }
      });
      
      totalConcreteVolume += floorConcreteVolume;
      totalGrade40Steel += floorGrade40Steel;
      totalGrade60Steel += floorGrade60Steel;
      
      floorBreakdown.push({
        floorId: floor.id,
        floorName: floor.name,
        concreteVolume: floorConcreteVolume,
        grade40Steel: floorGrade40Steel,
        grade60Steel: floorGrade60Steel,
        beamBreakdown,
      });
    });
    
    return {
      totalConcreteVolume,
      totalGrade40Steel,
      totalGrade60Steel,
      floorBreakdown,
    };
  };

  // Additional UI state
  const [selectedCoord, setSelectedCoord] = useState("");

  // Grid modification handlers
  const handleColChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...cols];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setCols(updated);
    // Ensure colBeamIds and rowBeamIds stay in sync with grid size
    const newColBeamIds = [...colBeamIds];
    const needed = numRows * (updated.length - 1);
    while (newColBeamIds.length < needed) newColBeamIds.push("");
    setColBeamIds(newColBeamIds.slice(0, needed));
    
    const newRowBeamIds = [...rowBeamIds];
    const neededRows = updated.length * (numRows - 1);
    while (newRowBeamIds.length < neededRows) newRowBeamIds.push("");
    setRowBeamIds(newRowBeamIds.slice(0, neededRows));
  };

  const handleRowChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...rows];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setRows(updated);
    // Ensure colBeamIds and rowBeamIds stay in sync with grid size
    const newColBeamIds = [...colBeamIds];
    const needed = updated.length * (numCols - 1);
    while (newColBeamIds.length < needed) newColBeamIds.push("");
    setColBeamIds(newColBeamIds.slice(0, needed));
    
    const newRowBeamIds = [...rowBeamIds];
    const neededRows = numCols * (updated.length - 1);
    while (newRowBeamIds.length < neededRows) newRowBeamIds.push("");
    setRowBeamIds(newRowBeamIds.slice(0, neededRows));
  };

  // Generate all grid coordinates
  const gridCoords = cols.map((col) =>
    rows.map((row) => `${col.label}${row.label}`)
  ).flat();

  // Find selected coordinate's position
  const selectedPos = (() => {
    if (!selectedCoord) return null;
    const colLabel = selectedCoord.match(/^[A-Z]/)?.[0];
    const rowLabel = selectedCoord.match(/[0-9]+$/)?.[0];
    const col = cols.find((c) => c.label === colLabel);
    const row = rows.find((r) => r.label === rowLabel);
    if (col && row) return { x: col.position, y: row.position };
    return null;
  })();

  // Calculate lengths between adjacent columns for each row

  // ...existing code...

  // Calculate lengths between adjacent columns for each row

  // Calculate lengths between adjacent columns for each row

  // Calculate lengths between adjacent columns for each row
  // For a 2x2 grid, only 2 segments for columns (X)
  // For each row, add all adjacent column pairs (A→B, B→C, ...)
  const colLengths: { row: string, from: string, to: string, length: number, beamId: string }[] = [];
  if (cols.length > 1) {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c < cols.length; c++) {
        colLengths.push({
          row: rows[r].label,
          from: cols[c - 1].label,
          to: cols[c].label,
          length: Math.abs(cols[c].position - cols[c - 1].position),
          beamId: colBeamIds[(r * (cols.length - 1)) + (c - 1)] || "",
        });
      }
    }
  }

  // Calculate lengths between adjacent rows for each column
  // For a 2x2 grid, only 2 segments for rows (Y)

  // Calculate row segments: for each column, for each adjacent row pair
  const rowLengths: { col: string, from: string, to: string, length: number, beamId: string }[] = [];
  if (rows.length > 1) {
    for (let c = 0; c < cols.length; c++) {
      for (let r = 1; r < rows.length; r++) {
        rowLengths.push({
          col: cols[c].label,
          from: rows[r - 1].label,
          to: rows[r].label,
          length: Math.abs(rows[r].position - rows[r - 1].position),
          beamId: rowBeamIds[(c * (rows.length - 1)) + (r - 1)] || "",
        });
      }
    }
  }

  // Consolidate segments by Beam ID (must be after colLengths and rowLengths are defined)
  const beamSummary: { beamId: string, segments: string[], totalLength: number, width: number, depth: number, volumePerMeter: number }[] = [];
  beamSpecs.forEach(beam => {
    const segments: string[] = [];
    let totalLength = 0;
    // Check column segments
    colLengths.forEach((len, idx) => {
      if (colBeamIds[idx] === beam.id) {
        segments.push(`${len.row}: ${len.from}-${len.to}`);
        totalLength += len.length;
      }
    });
    // Check row segments
    rowLengths.forEach((len, idx) => {
      if (rowBeamIds[idx] === beam.id) {
        segments.push(`${len.col}: ${len.from}-${len.to}`);
        totalLength += len.length;
      }
    });
    if (segments.length > 0) {
      beamSummary.push({
        beamId: beam.id,
        segments,
        totalLength,
        width: beam.width,
        depth: beam.depth,
        volumePerMeter: beam.width * beam.depth,
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('beams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'beams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Beam Specifications
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'grid'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >              Grid System & Assignment
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Building Summary
            </button>
          </nav>
        </div>
      </div>

      {/* Floor Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">{building.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Floor:</span>
                <select
                  value={currentFloorId}
                  onChange={(e) => setCurrentFloorId(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {building.floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name} (Level {floor.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={addFloor}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Floor
              </button>
              {building.floors.length > 1 && (
                <button
                  onClick={() => deleteFloor(currentFloorId)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Floor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto py-10 px-4">
        {activeTab === 'beams' && (
          <div>
            {/* Beam Specifications Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Beam Specifications</h2>
              <p className="text-gray-600">Configure beam dimensions and reinforcement details</p>
            </div>

            {/* Beam Cards Grid */}
            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-8">
              {beamSpecs.map((beam) => (
                <div key={beam.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={beam.id}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Only update if the new ID doesn't already exist or is the same beam
                            const isDuplicate = beamSpecs.some(b => b.id === newValue && b !== beam);
                            if (!isDuplicate) {
                              const newSpecs = beamSpecs.map(b => 
                                b.id === beam.id ? { ...b, id: newValue } : b
                              );
                              setBeamSpecs(newSpecs);
                            }
                          }}
                          className="text-xl font-semibold bg-transparent border-b border-blue-300 border-opacity-50 text-white placeholder-blue-200 focus:outline-none focus:border-white w-full"
                          placeholder="Beam Name"
                        />
                        <p className="text-blue-100 text-sm mt-1">Beam Configuration</p>
                      </div>
                      <button
                        onClick={() => {
                          const newSpecs = beamSpecs.filter(b => b.id !== beam.id);
                          setBeamSpecs(newSpecs);
                        }}
                        className="ml-4 p-2 hover:bg-red-600 rounded-md transition-colors duration-200 group"
                        title="Delete Beam"
                      >
                        <svg className="w-4 h-4 text-red-200 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Dimensions Section */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Dimensions
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Width (m)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={beam.width}
                            onChange={(e) => {
                              const newSpecs = beamSpecs.map(b => 
                                b.id === beam.id ? { ...b, width: parseFloat(e.target.value) || 0 } : b
                              );
                              setBeamSpecs(newSpecs);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Depth (m)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={beam.depth}
                            onChange={(e) => {
                              const newSpecs = beamSpecs.map(b => 
                                b.id === beam.id ? { ...b, depth: parseFloat(e.target.value) || 0 } : b
                              );
                              setBeamSpecs(newSpecs);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reinforcement Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        Reinforcement Details
                      </h4>
                      <div className="space-y-4">
                        {[
                          { key: 'top', label: 'Top Bars', sizeKey: 'topBarSize', qtyKey: 'topBarQty' },
                          { key: 'web', label: 'Web Bars', sizeKey: 'webBarSize', qtyKey: 'webBarQty' },
                          { key: 'bottom', label: 'Bottom Bars', sizeKey: 'bottomBarSize', qtyKey: 'bottomBarQty' },
                          { key: 'stirrup', label: 'Stirrups', sizeKey: 'stirrupSize', qtyKey: 'stirrupQty' },
                        ].map(({ key, label, sizeKey, qtyKey }) => (
                          <div key={key} className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{label} Size</label>
                              <select
                                value={beam[sizeKey as keyof BeamSpec] || ''}
                                onChange={(e) => {
                                  const newSpecs = beamSpecs.map(b => 
                                    b.id === beam.id ? { ...b, [sizeKey]: e.target.value ? parseInt(e.target.value) : null } : b
                                  );
                                  setBeamSpecs(newSpecs);
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">-</option>
                                {BAR_SIZES.map(size => (
                                  <option key={size} value={size}>{size}mm</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="0"
                                value={beam[qtyKey as keyof BeamSpec] || 0}
                                onChange={(e) => {
                                  const newSpecs = beamSpecs.map(b => 
                                    b.id === beam.id ? { ...b, [qtyKey]: parseInt(e.target.value) || 0 } : b
                                  );
                                  setBeamSpecs(newSpecs);
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Fields Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Calculated Values per Meter
                      </h4>
                      <div className="bg-gray-50 rounded-md p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Concrete Volume:</span>
                          <span className="text-sm font-medium">{(beam.width * beam.depth).toFixed(3)} m³/m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Grade 40 Steel (&lt;16mm):</span>
                          <span className="text-sm font-medium">{calculateReinforcementWeights(beam).grade40Weight.toFixed(2)} kg/m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Grade 60 Steel (≥16mm):</span>
                          <span className="text-sm font-medium">{calculateReinforcementWeights(beam).grade60Weight.toFixed(2)} kg/m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Beam Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setBeamSpecs([...beamSpecs, { 
                    id: `B${beamSpecs.length + 1}`, 
                    width: 0.3, 
                    depth: 0.5, 
                    topBarSize: 12, 
                    topBarQty: 2, 
                    webBarSize: 8, 
                    webBarQty: 2, 
                    bottomBarSize: 12, 
                    bottomBarQty: 2, 
                    stirrupSize: 8, 
                    stirrupQty: 6 
                  }]);
                }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Beam
              </button>
            </div>
          </div>
        )}

        {activeTab === 'grid' && (
          <div>
            {/* Grid System Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Grid System & Assignment</h2>
              <p className="text-gray-600">Configure grid layout and assign beam types to grid segments</p>
            </div>

            {/* Grid Configuration Cards */}
            <div className="flex gap-6 mb-8">
              {/* Grid Size Card - 10% width */}
              <div className="w-1/6 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">Grid Size</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Columns</label>
                    <input
                      type="number"
                      min={1}
                      value={numCols}
                      onChange={handleNumColsChange}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Rows</label>
                    <input
                      type="number"
                      min={1}
                      value={numRows}
                      onChange={handleNumRowsChange}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Beam Summary Card - 90% width */}
              <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Beam Summary & Segments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Beam ID</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Segments</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Total Length</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Volume (m³)</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Grade 40 (kg)</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Grade 60 (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beamSummary.map((row, idx) => {
                        const beam = beamSpecs.find(b => b.id === row.beamId);
                        const weights = beam ? calculateReinforcementWeights(beam) : { grade40Weight: 0, grade60Weight: 0 };
                        return (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="p-3 font-medium">{row.beamId}</td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">
                                {row.segments.map((segment, segIdx) => (
                                  <span key={segIdx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                                    {segment}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-center">{row.totalLength}m</td>
                            <td className="p-3 text-sm text-center">{(row.totalLength * row.volumePerMeter).toFixed(3)}</td>
                            <td className="p-3 text-sm text-center">{(weights.grade40Weight * row.totalLength).toFixed(2)}</td>
                            <td className="p-3 text-sm text-center">{(weights.grade60Weight * row.totalLength).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {beamSummary.length === 0 && (
                        <tr>
                          <td className="p-3 text-gray-500 text-center" colSpan={6}>No segments assigned yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Grid Definition Tables */}
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Columns (Grid X)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Label</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Position (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cols.map((col, idx) => (
                        <tr key={col.label} className="border-t border-gray-200">
                          <td className="p-3 text-center">
                            <input
                              value={col.label}
                              onChange={(e) => handleColChange(idx, "label", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={col.position}
                              onChange={(e) => handleColChange(idx, "position", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rows (Grid Y)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Label</th>
                        <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Position (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={row.label} className="border-t border-gray-200">
                          <td className="p-3 text-center">
                            <input
                              value={row.label}
                              onChange={(e) => handleRowChange(idx, "label", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={row.position}
                              onChange={(e) => handleRowChange(idx, "position", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Beam Assignment Tables */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Beams (X Direction)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Row</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">From</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">To</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Length (m)</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Beam ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colLengths.map((len, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="p-2 text-center">{len.row}</td>
                          <td className="p-2 text-center">{len.from}</td>
                          <td className="p-2 text-center">{len.to}</td>
                          <td className="p-2 text-center">{len.length}</td>
                          <td className="p-2 text-center">
                            <select
                              value={len.beamId}
                              onChange={e => {
                                const updated = [...colBeamIds];
                                updated[idx] = e.target.value;
                                setColBeamIds(updated);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Select Beam</option>
                              {beamSpecs.map((beam, i) => (
                                <option key={i} value={beam.id}>{beam.id}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Row Beams (Y Direction)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Column</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">From</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">To</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Length (m)</th>
                        <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Beam ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowLengths.map((len, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="p-2 text-center">{len.col}</td>
                          <td className="p-2 text-center">{len.from}</td>
                          <td className="p-2 text-center">{len.to}</td>
                          <td className="p-2 text-center">{len.length}</td>
                          <td className="p-2 text-center">
                            <select
                              value={len.beamId}
                              onChange={e => {
                                const updated = [...rowBeamIds];
                                updated[idx] = e.target.value;
                                setRowBeamIds(updated);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Select Beam</option>
                              {beamSpecs.map((beam, i) => (
                                <option key={i} value={beam.id}>{beam.id}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div>
            {/* Building Summary Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Building Summary</h2>
              <p className="text-gray-600">Comprehensive material overview for {building.name}</p>
            </div>

            {(() => {
              const summary = calculateBuildingSummary();
              
              return (
                <div className="space-y-8">
                  {/* Building Totals Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-semibold text-white">Building Totals</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {summary.totalConcreteVolume.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">Concrete Volume (m³)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {summary.totalGrade40Steel.toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-600">Grade 40 Steel (kg)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600 mb-1">
                            {summary.totalGrade60Steel.toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-600">Grade 60 Steel (kg)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floor-by-Floor Breakdown */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Floor Breakdown</h3>
                    {summary.floorBreakdown.map((floor) => (
                      <div key={floor.floorId} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        {/* Floor Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-900">{floor.floorName}</h4>
                            <div className="flex space-x-6 text-sm">
                              <span className="text-gray-600">
                                <strong>Concrete:</strong> {floor.concreteVolume.toFixed(2)} m³
                              </span>
                              <span className="text-orange-600">
                                <strong>Grade 40:</strong> {floor.grade40Steel.toFixed(0)} kg
                              </span>
                              <span className="text-red-600">
                                <strong>Grade 60:</strong> {floor.grade60Steel.toFixed(0)} kg
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Beam Details */}
                        <div className="p-6">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-2 font-medium text-gray-900">Beam ID</th>
                                  <th className="text-center py-3 px-2 font-medium text-gray-900">Segments</th>
                                  <th className="text-center py-3 px-2 font-medium text-gray-900">Total Length (m)</th>
                                  <th className="text-center py-3 px-2 font-medium text-gray-900">Concrete (m³)</th>
                                  <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 40 (kg)</th>
                                  <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 60 (kg)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {floor.beamBreakdown.map((beam) => (
                                  <tr key={beam.beamId} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-2 font-medium text-blue-600">{beam.beamId}</td>
                                    <td className="py-3 px-2 text-center text-sm text-gray-600">
                                      {beam.segments.join(', ')}
                                    </td>
                                    <td className="py-3 px-2 text-center font-mono">{beam.totalLength.toFixed(1)}</td>
                                    <td className="py-3 px-2 text-center font-mono">{beam.concreteVolume.toFixed(2)}</td>
                                    <td className="py-3 px-2 text-center font-mono text-orange-600">
                                      {beam.grade40Steel.toFixed(0)}
                                    </td>
                                    <td className="py-3 px-2 text-center font-mono text-red-600">
                                      {beam.grade60Steel.toFixed(0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
