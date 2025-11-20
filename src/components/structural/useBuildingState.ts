import { useState, useCallback } from 'react';
import { Building, Floor, BeamSpec, ColumnSpec, SlabSpec, SlabAssignment } from './types';
import { defaultBuilding } from './defaultData';

export const useBuildingState = () => {
  const [building, setBuilding] = useState<Building>(defaultBuilding);
  const [currentFloorId, setCurrentFloorId] = useState("floor-1");

  // Current floor computed values
  const currentFloor = building.floors.find((f: Floor) => f.id === currentFloorId) || building.floors[0];

  // Update current floor helper
  const updateCurrentFloor = useCallback((updates: Partial<Floor>) => {
    setBuilding((prev: Building) => ({
      ...prev,
      floors: prev.floors.map((floor: Floor) =>
        floor.id === currentFloorId
          ? { ...floor, ...updates }
          : floor
      ),
    }));
  }, [currentFloorId]);

  // Floor management
  const addFloor = useCallback(() => {
    const newFloorLevel = building.floors.length + 1;
    const newFloor: Floor = {
      id: `floor-${newFloorLevel}`,
      level: newFloorLevel,
      name: `Floor ${newFloorLevel}`,
      structuralSystem: {
        ...building.floors[0].structuralSystem, // Inherit from ground floor
      },
      beamSpecs: [...building.floors[0].beamSpecs], // Copy beam specs
      columnSpecs: [...building.floors[0].columnSpecs], // Copy column specs
      slabSpecs: building.floors[0].slabSpecs ? [...building.floors[0].slabSpecs] : [], // Copy slab specs
      slabAssignments: building.floors[0].slabAssignments ? [...building.floors[0].slabAssignments] : [], // Copy slab assignments
      colBeamIds: Array(building.floors[0].structuralSystem.numRows * (building.floors[0].structuralSystem.numCols - 1)).fill(""),
      rowBeamIds: Array(building.floors[0].structuralSystem.numCols * (building.floors[0].structuralSystem.numRows - 1)).fill(""),
      columnIds: Array(building.floors[0].structuralSystem.numCols * building.floors[0].structuralSystem.numRows).fill(""),
      inheritsStructural: true,
    };

    setBuilding((prev: Building) => ({
      ...prev,
      floors: [...prev.floors, newFloor],
    }));
    setCurrentFloorId(newFloor.id);
  }, [building.floors]);

  const deleteFloor = useCallback((floorId: string) => {
    if (building.floors.length <= 1) return; // Don't allow deleting the last floor

    setBuilding((prev: Building) => ({
      ...prev,
      floors: prev.floors.filter((f: Floor) => f.id !== floorId),
    }));

    // If deleting current floor, switch to another floor
    if (floorId === currentFloorId) {
      const remainingFloors = building.floors.filter((f: Floor) => f.id !== floorId);
      setCurrentFloorId(remainingFloors[0]?.id || "");
    }
  }, [building.floors, currentFloorId]);

  // Beam and column management
  const setBeamSpecs = useCallback((newSpecs: BeamSpec[]) => {
    updateCurrentFloor({ beamSpecs: newSpecs });
  }, [updateCurrentFloor]);

  const setColumnSpecs = useCallback((newSpecs: ColumnSpec[]) => {
    updateCurrentFloor({ columnSpecs: newSpecs });
  }, [updateCurrentFloor]);

  const setSlabSpecs = useCallback((newSpecs: SlabSpec[]) => {
    updateCurrentFloor({ slabSpecs: newSpecs });
  }, [updateCurrentFloor]);

  const setSlabAssignments = useCallback((newAssignments: SlabAssignment[]) => {
    updateCurrentFloor({ slabAssignments: newAssignments });
  }, [updateCurrentFloor]);

  const setColBeamIds = useCallback((newIds: string[]) => {
    updateCurrentFloor({ colBeamIds: newIds });
  }, [updateCurrentFloor]);

  const setRowBeamIds = useCallback((newIds: string[]) => {
    updateCurrentFloor({ rowBeamIds: newIds });
  }, [updateCurrentFloor]);

  const setColumnIds = useCallback((newIds: string[]) => {
    updateCurrentFloor({ columnIds: newIds });
  }, [updateCurrentFloor]);

  // Grid system management
  const setCols = useCallback((newCols: Array<{ label: string; position: number }>) => {
    updateCurrentFloor({
      structuralSystem: {
        ...currentFloor.structuralSystem,
        cols: newCols,
        numCols: newCols.length,
      },
    });
  }, [updateCurrentFloor, currentFloor.structuralSystem]);

  const setRows = useCallback((newRows: Array<{ label: string; position: number }>) => {
    updateCurrentFloor({
      structuralSystem: {
        ...currentFloor.structuralSystem,
        rows: newRows,
        numRows: newRows.length,
      },
    });
  }, [updateCurrentFloor, currentFloor.structuralSystem]);

  return {
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
  };
};