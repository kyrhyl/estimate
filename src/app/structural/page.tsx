"use client";
import { useState } from "react";
import { BuildingSummary } from "../../components/structural/types";
import { calculateBuildingSummary } from "../../components/structural/utils";
import { useBuildingState } from "../../components/structural/useBuildingState";
import { useGridHandlers } from "../../components/structural/useGridHandlers";
import TabNavigation from "../../components/structural/TabNavigation";
import BeamTab from "../../components/structural/BeamTab";
import ColumnTab from "../../components/structural/ColumnTab";
import GridTab from "../../components/structural/GridTab";
import SummaryTab from "../../components/structural/SummaryTab";

export default function StructuralPage() {
  const [activeTab, setActiveTab] = useState<'beams' | 'columns' | 'grid' | 'summary'>('beams');

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
    setColBeamIds,
    setRowBeamIds,
    setColumnIds,
    setCols,
    setRows,
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
          <ColumnTab columnSpecs={columnSpecs} updateCurrentFloor={(updates) => {}} />
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
            handleNumColsChange={handleNumColsChange}
            handleNumRowsChange={handleNumRowsChange}
            handleColChange={handleColChange}
            handleRowChange={handleRowChange}
            setColBeamIds={setColBeamIds}
            setRowBeamIds={setRowBeamIds}
            updateCurrentFloor={(updates) => {}}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab building={building} />
        )}
      </div>
    </div>
  );
}