import { useState, useCallback } from 'react';

export const useGridHandlers = (
  cols: Array<{ label: string; position: number }>,
  rows: Array<{ label: string; position: number }>,
  numRows: number,
  setCols: (cols: Array<{ label: string; position: number }>) => void,
  setRows: (rows: Array<{ label: string; position: number }>) => void,
  setColBeamIds: (ids: string[]) => void,
  setRowBeamIds: (ids: string[]) => void,
  colBeamIds: string[],
  rowBeamIds: string[]
) => {
  const [selectedCoord, setSelectedCoord] = useState("");

  // Grid modification handlers
  const handleColChange = useCallback((idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...cols];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setCols(updated);
    // Ensure colBeamIds and rowBeamIds stay in sync with grid size
    const newColBeamIds = [...colBeamIds];
    const needed = numRows * (updated.length - 1);
    while (newColBeamIds.length < needed) newColBeamIds.push("");
    setColBeamIds(newColBeamIds.slice(0, needed));
  }, [cols, numRows, setCols, setColBeamIds, colBeamIds]);

  const handleRowChange = useCallback((idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...rows];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setRows(updated);
    // Ensure rowBeamIds stay in sync with grid size
    const newRowBeamIds = [...rowBeamIds];
    const needed = updated.length * (cols.length - 1);
    while (newRowBeamIds.length < needed) newRowBeamIds.push("");
    setRowBeamIds(newRowBeamIds.slice(0, needed));
  }, [rows, cols.length, setRows, setRowBeamIds, rowBeamIds]);

  const handleNumColsChange = useCallback((newNumCols: number) => {
    if (newNumCols < 2 || newNumCols > 10) return;

    const currentCols = cols.length;
    let newCols = [...cols];

    if (newNumCols > currentCols) {
      // Add columns
      for (let i = currentCols; i < newNumCols; i++) {
        const position = i * 5; // Default spacing
        newCols.push({ label: (i + 1).toString(), position });
      }
    } else if (newNumCols < currentCols) {
      // Remove columns
      newCols = newCols.slice(0, newNumCols);
    }

    setCols(newCols);
    // Update beam and column arrays
    const newColBeamIds = Array(numRows * (newNumCols - 1)).fill("");
    setColBeamIds(newColBeamIds);
    const newRowBeamIds = Array(newNumCols * (rows.length - 1)).fill("");
    setRowBeamIds(newRowBeamIds);
  }, [cols, numRows, rows.length, setCols, setColBeamIds, setRowBeamIds]);

  const handleNumRowsChange = useCallback((newNumRows: number) => {
    if (newNumRows < 2 || newNumRows > 10) return;

    const currentRows = rows.length;
    let newRows = [...rows];

    if (newNumRows > currentRows) {
      // Add rows
      for (let i = currentRows; i < newNumRows; i++) {
        const position = i * 4; // Default spacing
        newRows.push({ label: String.fromCharCode(65 + i), position }); // A, B, C, etc.
      }
    } else if (newNumRows < currentRows) {
      // Remove rows
      newRows = newRows.slice(0, newNumRows);
    }

    setRows(newRows);
    // Update beam arrays
    const newColBeamIds = Array(newNumRows * (cols.length - 1)).fill("");
    setColBeamIds(newColBeamIds);
  }, [rows, cols.length, setRows, setColBeamIds]);

  return {
    selectedCoord,
    setSelectedCoord,
    handleColChange,
    handleRowChange,
    handleNumColsChange,
    handleNumRowsChange,
  };
};