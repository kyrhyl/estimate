"use client";
import { useState } from "react";
import { BuildingSummary, Building, Floor, BeamSpec, ColumnSpec } from "../../components/structural/types";
import { calculateBuildingSummary, calculateReinforcementWeights, calculateColumnReinforcementWeights, calculateSlabConcreteVolume, calculateSlabReinforcementWeights } from "../../components/structural/utils";
import { useBuildingState } from "../../components/structural/useBuildingState";
import { useGridHandlers } from "../../components/structural/useGridHandlers";
import TabNavigation from "../../components/structural/TabNavigation";
import BeamTab from "../../components/structural/BeamTab";
import ColumnTab from "../../components/structural/ColumnTab";
import SlabTab from "../../components/structural/SlabTab";
import SlabAssignmentTab from "../../components/structural/SlabAssignmentTab";
import GridTab from "../../components/structural/GridTab";
import SummaryTab from "../../components/structural/SummaryTab";

// Test version that considers column width in beam spans
// Test version that considers column width in beam spans
const calculateBuildingSummaryWithColumnWidth = (building: Building): BuildingSummary => {
  let totalConcreteVolume = 0;
  let totalGrade40Steel = 0;
  let totalGrade60Steel = 0;
  const floorBreakdown: BuildingSummary['floorBreakdown'] = [];

  building.floors.forEach(floor => {
    // Calculate beam summary for this floor with column width consideration
    const beamSummaryMap = new Map();
    
    // Column lengths (X direction) - adjusted for column width
    const colLengths = [];
    for (let r = 0; r < floor.structuralSystem.numRows; r++) {
      for (let c = 0; c < floor.structuralSystem.numCols - 1; c++) {
        const from = floor.structuralSystem.cols[c];
        const to = floor.structuralSystem.cols[c + 1];
        let length = Math.abs(to.position - from.position);
        
        // Subtract column widths
        const startColIndex = r * floor.structuralSystem.numCols + c;
        const endColIndex = r * floor.structuralSystem.numCols + (c + 1);
        const startColumnId = floor.columnIds[startColIndex];
        const endColumnId = floor.columnIds[endColIndex];
        
        let startColWidth = 0;
        let endColWidth = 0;
        
        if (startColumnId) {
          const startCol = floor.columnSpecs.find(col => col.id === startColumnId);
          if (startCol) startColWidth = startCol.width;
        }
        if (endColumnId) {
          const endCol = floor.columnSpecs.find(col => col.id === endColumnId);
          if (endCol) endColWidth = endCol.width;
        }
        
        // Adjust length for column widths (half width from each end)
        length = Math.max(0, length - (startColWidth / 2 + endColWidth / 2));
        
        const beamIdIndex = r * (floor.structuralSystem.numCols - 1) + c;
        const beamId = floor.colBeamIds[beamIdIndex];
        if (beamId) {
          colLengths.push({ beamId, len: length, segment: `${floor.structuralSystem.rows[r].label}${from.label}-${floor.structuralSystem.rows[r].label}${to.label}` });
        }
      }
    }
    
    // Row lengths (Y direction) - adjusted for column depth
    const rowLengths = [];
    for (let c = 0; c < floor.structuralSystem.numCols; c++) {
      for (let r = 0; r < floor.structuralSystem.numRows - 1; r++) {
        const from = floor.structuralSystem.rows[r];
        const to = floor.structuralSystem.rows[r + 1];
        let length = Math.abs(to.position - from.position);
        
        // Subtract column depths
        const startColIndex = r * floor.structuralSystem.numCols + c;
        const endColIndex = (r + 1) * floor.structuralSystem.numCols + c;
        const startColumnId = floor.columnIds[startColIndex];
        const endColumnId = floor.columnIds[endColIndex];
        
        let startColDepth = 0;
        let endColDepth = 0;
        
        if (startColumnId) {
          const startCol = floor.columnSpecs.find(col => col.id === startColumnId);
          if (startCol) startColDepth = startCol.depth;
        }
        if (endColumnId) {
          const endCol = floor.columnSpecs.find(col => col.id === endColumnId);
          if (endCol) endColDepth = endCol.depth;
        }
        
        // Adjust length for column depths (half depth from each end)
        length = Math.max(0, length - (startColDepth / 2 + endColDepth / 2));
        
        const beamIdIndex = c * (floor.structuralSystem.numRows - 1) + r;
        const beamId = floor.rowBeamIds[beamIdIndex];
        if (beamId) {
          rowLengths.push({ beamId, len: length, segment: `${from.label}${floor.structuralSystem.cols[c].label}-${to.label}${floor.structuralSystem.cols[c].label}` });
        }
      }
    }
    
    // Aggregate beam data
    [...colLengths, ...rowLengths].forEach(({ beamId, len, segment }) => {
      if (!beamSummaryMap.has(beamId)) {
        beamSummaryMap.set(beamId, { segments: [], totalLength: 0 });
      }
      const summary = beamSummaryMap.get(beamId);
      summary.segments.push(segment);
      summary.totalLength += len;
    });
    
    // Calculate floor totals (same as original)
    let floorConcreteVolume = 0;
    let floorGrade40Steel = 0;
    let floorGrade60Steel = 0;
    const beamBreakdown: BuildingSummary['floorBreakdown'][0]['beamBreakdown'] = [];
    const columnBreakdown: BuildingSummary['floorBreakdown'][0]['columnBreakdown'] = [];
    
    // Add beam calculations
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
    
    // Add column calculations (same as original)
    const columnSummaryMap = new Map();
    floor.columnIds.forEach((columnId, index) => {
      if (columnId) {
        const rowIndex = Math.floor(index / floor.structuralSystem.numCols);
        const colIndex = index % floor.structuralSystem.numCols;
        const location = `${floor.structuralSystem.rows[rowIndex].label}${floor.structuralSystem.cols[colIndex].label}`;
        
        if (!columnSummaryMap.has(columnId)) {
          columnSummaryMap.set(columnId, { locations: [], count: 0 });
        }
        const summary = columnSummaryMap.get(columnId);
        summary.locations.push(location);
        summary.count += 1;
      }
    });
    
    columnSummaryMap.forEach((summary, columnId) => {
      const column = floor.columnSpecs.find(c => c.id === columnId);
      if (column) {
        const singleColumnConcreteVolume = column.width * column.depth * column.height;
        const weights = calculateColumnReinforcementWeights(column);
        const totalColumnConcreteVolume = singleColumnConcreteVolume * summary.count;
        const totalGrade40Steel = weights.grade40Weight * summary.count;
        const totalGrade60Steel = weights.grade60Weight * summary.count;
        
        floorConcreteVolume += totalColumnConcreteVolume;
        floorGrade40Steel += totalGrade40Steel;
        floorGrade60Steel += totalGrade60Steel;
        
        columnBreakdown.push({
          columnId,
          locations: summary.locations,
          count: summary.count,
          concreteVolume: totalColumnConcreteVolume,
          grade40Steel: totalGrade40Steel,
          grade60Steel: totalGrade60Steel,
        });
      }
    });
    
    // Add slab calculations (same as original)
    const slabBreakdown: BuildingSummary['floorBreakdown'][0]['slabBreakdown'] = [];
    if (floor.slabAssignments && floor.slabSpecs) {
      const slabSummaryMap = new Map();
      floor.slabAssignments.forEach((assignment) => {
        if (!slabSummaryMap.has(assignment.slabSpecId)) {
          slabSummaryMap.set(assignment.slabSpecId, { areas: [], totalArea: 0 });
        }
        const summary = slabSummaryMap.get(assignment.slabSpecId);
        summary.areas.push(`${assignment.startRow}${assignment.startCol}-${assignment.endRow}${assignment.endCol}`);
        summary.totalArea += assignment.area;
      });
      
      slabSummaryMap.forEach((summary, slabId) => {
        const slab = floor.slabSpecs!.find(s => s.id === slabId);
        if (slab) {
          const slabConcreteVolume = calculateSlabConcreteVolume(slab, summary.totalArea);
          const weights = calculateSlabReinforcementWeights(slab);
          const slabGrade40Steel = weights.grade40Weight * summary.totalArea;
          const slabGrade60Steel = weights.grade60Weight * summary.totalArea;
          
          floorConcreteVolume += slabConcreteVolume;
          floorGrade40Steel += slabGrade40Steel;
          floorGrade60Steel += slabGrade60Steel;
          
          slabBreakdown.push({
            slabId,
            areas: summary.areas,
            totalArea: summary.totalArea,
            concreteVolume: slabConcreteVolume,
            grade40Steel: slabGrade40Steel,
            grade60Steel: slabGrade60Steel,
          });
        }
      });
    }
    
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
      columnBreakdown,
      slabBreakdown,
    });
  });
  
  return {
    totalConcreteVolume,
    totalGrade40Steel,
    totalGrade60Steel,
    floorBreakdown,
  };
};

export default function StructuralPage() {
  const [activeTab, setActiveTab] = useState<'beams' | 'columns' | 'slabs' | 'grid' | 'summary'>('beams');

  // Use custom hooks for state management
  const {
    building,
    currentFloorId,
    currentFloor,
    setCurrentFloorId,
    addFloor,
    deleteFloor,
    setBeamSpecs,
    setColumnSpecs,
    setSlabSpecs,
    setSlabAssignments,
    setColBeamIds,
    setRowBeamIds,
    setColumnIds,
    setCols,
    setRows,
    updateCurrentFloor,
  } = useBuildingState();

  // Grid handlers
  const {
    selectedCoord,
    setSelectedCoord,
    handleColChange,
    handleRowChange,
    handleNumColsChange,
    handleNumRowsChange,
  } = useGridHandlers(
    currentFloor.structuralSystem.cols,
    currentFloor.structuralSystem.rows,
    currentFloor.structuralSystem.numRows,
    setCols,
    setRows,
    setColBeamIds,
    setRowBeamIds,
    currentFloor.colBeamIds,
    currentFloor.rowBeamIds
  );

  // Current floor computed values
  const numCols = currentFloor.structuralSystem.numCols;
  const numRows = currentFloor.structuralSystem.numRows;
  const cols = currentFloor.structuralSystem.cols;
  const rows = currentFloor.structuralSystem.rows;
  const beamSpecs = currentFloor.beamSpecs;
  const columnSpecs = currentFloor.columnSpecs;
  const colBeamIds = currentFloor.colBeamIds;
  const rowBeamIds = currentFloor.rowBeamIds;
  const columnIds = currentFloor.columnIds;

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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
          <BeamTab beamSpecs={beamSpecs} setBeamSpecs={setBeamSpecs} />
        )}

        {activeTab === 'columns' && (
          <ColumnTab columnSpecs={columnSpecs} updateCurrentFloor={updateCurrentFloor} />
        )}

        {activeTab === 'slabs' && (
          <SlabTab slabSpecs={currentFloor.slabSpecs || []} setSlabSpecs={setSlabSpecs} />
        )}

        {activeTab === 'grid' && (
          <GridTab
            numCols={numCols}
            numRows={numRows}
            cols={cols}
            rows={rows}
            colBeamIds={colBeamIds}
            rowBeamIds={rowBeamIds}
            columnIds={columnIds}
            beamSpecs={beamSpecs}
            columnSpecs={columnSpecs}
            slabSpecs={currentFloor.slabSpecs || []}
            slabAssignments={currentFloor.slabAssignments || []}
            setSlabAssignments={setSlabAssignments}
            handleNumColsChange={handleNumColsChange}
            handleNumRowsChange={handleNumRowsChange}
            handleColChange={handleColChange}
            handleRowChange={handleRowChange}
            setColBeamIds={setColBeamIds}
            setRowBeamIds={setRowBeamIds}
            updateCurrentFloor={updateCurrentFloor}
          />
        )}

        {activeTab === 'summary' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Building Summary (Test - Column Width Adjusted)</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {(() => {
                const summary = calculateBuildingSummary(building);
                return (
                  <div className="space-y-6">
                    {/* Overall Totals */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Building Quantities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">{summary.totalConcreteVolume.toFixed(2)} m³</div>
                          <div className="text-sm text-gray-600">Total Concrete Volume</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-green-600">{summary.totalGrade40Steel.toFixed(1)} kg</div>
                          <div className="text-sm text-gray-600">Grade 40 Steel</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-orange-600">{summary.totalGrade60Steel.toFixed(1)} kg</div>
                          <div className="text-sm text-gray-600">Grade 60 Steel</div>
                        </div>
                      </div>
                    </div>

                    {/* Floor Breakdown */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Floor Breakdown</h3>
                      <div className="space-y-4">
                        {summary.floorBreakdown.map((floor) => (
                          <div key={floor.floorId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                              <h4 className="text-lg font-medium text-gray-900">{floor.floorName}</h4>
                            </div>
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-600">{floor.concreteVolume.toFixed(2)} m³</div>
                                  <div className="text-sm text-gray-600">Concrete</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-green-600">{floor.grade40Steel.toFixed(1)} kg</div>
                                  <div className="text-sm text-gray-600">Grade 40</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-orange-600">{floor.grade60Steel.toFixed(1)} kg</div>
                                  <div className="text-sm text-gray-600">Grade 60</div>
                                </div>
                              </div>

                              {/* Beam Breakdown */}
                              {floor.beamBreakdown.length > 0 && (
                                <div className="mb-6">
                                  <h5 className="text-md font-medium text-gray-900 mb-3">Beams</h5>
                                  <div className="space-y-2">
                                    {floor.beamBreakdown.map((beam) => (
                                      <div key={beam.beamId} className="bg-gray-50 rounded p-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium text-gray-900">{beam.beamId}</span>
                                          <span className="text-sm text-gray-600">{beam.totalLength.toFixed(2)}m total</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                          Segments: {beam.segments.join(', ')}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div>Conc: {beam.concreteVolume.toFixed(2)}m³</div>
                                          <div>G40: {beam.grade40Steel.toFixed(1)}kg</div>
                                          <div>G60: {beam.grade60Steel.toFixed(1)}kg</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Column Breakdown */}
                              {floor.columnBreakdown.length > 0 && (
                                <div className="mb-6">
                                  <h5 className="text-md font-medium text-gray-900 mb-3">Columns</h5>
                                  <div className="space-y-2">
                                    {floor.columnBreakdown.map((column) => (
                                      <div key={column.columnId} className="bg-gray-50 rounded p-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium text-gray-900">{column.columnId}</span>
                                          <span className="text-sm text-gray-600">{column.count} locations</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                          Locations: {column.locations.join(', ')}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div>Conc: {column.concreteVolume.toFixed(2)}m³</div>
                                          <div>G40: {column.grade40Steel.toFixed(1)}kg</div>
                                          <div>G60: {column.grade60Steel.toFixed(1)}kg</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Slab Breakdown */}
                              {floor.slabBreakdown.length > 0 && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-900 mb-3">Slabs</h5>
                                  <div className="space-y-2">
                                    {floor.slabBreakdown.map((slab) => (
                                      <div key={slab.slabId} className="bg-gray-50 rounded p-3">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium text-gray-900">{slab.slabId}</span>
                                          <span className="text-sm text-gray-600">{slab.totalArea.toFixed(2)}m²</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                          Areas: {slab.areas.join(', ')}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                          <div>Conc: {slab.concreteVolume.toFixed(2)}m³</div>
                                          <div>G40: {slab.grade40Steel.toFixed(1)}kg</div>
                                          <div>G60: {slab.grade60Steel.toFixed(1)}kg</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}