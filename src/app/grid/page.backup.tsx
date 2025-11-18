// Backup of working grid page as of 2025-11-18
"use client";
import { useState } from "react";
// ...existing code...

export default function GridPage() {
    // Handler to update number of columns
    const handleNumColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(1, Number(e.target.value));
      setNumCols(value);
      // Adjust columns array
      setCols(prev => {
        const arr = [...prev];
        while (arr.length < value) {
          arr.push({ label: String.fromCharCode(65 + arr.length), position: arr.length * 5 });
        }
        return arr.slice(0, value);
      });
      setColBeamIds(Array(numRows * (value - 1)).fill(""));
    };

    // Handler to update number of rows
    const handleNumRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(1, Number(e.target.value));
      setNumRows(value);
      setRows(prev => {
        const arr = [...prev];
        while (arr.length < value) {
          arr.push({ label: String(arr.length + 1), position: arr.length * 4 });
        }
        return arr.slice(0, value);
      });
      setRowBeamIds(Array(numCols * (value - 1)).fill(""));
    };
  const [numCols, setNumCols] = useState(4);
  const [numRows, setNumRows] = useState(4);
  const [cols, setCols] = useState([
    { label: "A", position: 0 },
    { label: "B", position: 5 },
    { label: "C", position: 10 },
    { label: "D", position: 15 },
  ]);
  const [rows, setRows] = useState([
    { label: "1", position: 0 },
    { label: "2", position: 4 },
    { label: "3", position: 8 },
    { label: "4", position: 12 },
  ]);
  const [selectedCoord, setSelectedCoord] = useState("");
  // User-defined Beam IDs
  const [beamIdList, setBeamIdList] = useState(["B1", "B2", "B3"]);
  // Selected Beam IDs for each length
  const [colBeamIds, setColBeamIds] = useState(Array(rows.length * (cols.length - 1)).fill(""));
  const [rowBeamIds, setRowBeamIds] = useState(Array(cols.length * (rows.length - 1)).fill(""));

  const handleColChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...cols];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setCols(updated);
  };
  const handleRowChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...rows];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setRows(updated);
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

  // Column segments: for each row, for each adjacent column pair
  const colLengths: { row: string, from: string, to: string, length: number, beamId: string }[] = [];
  if (cols.length > 1) {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c < cols.length; c++) {
        colLengths.push({
          row: rows[r].label,
          from: cols[c - 1].label,
          to: cols[c].label,
          length: cols[c].position - cols[c - 1].position,
          beamId: colBeamIds[(r * (cols.length - 1)) + (c - 1)] || "",
        });
      }
    }
  }

  // Row segments: for each column, for each adjacent row pair
  const rowLengths: { col: string, from: string, to: string, length: number, beamId: string }[] = [];
  if (rows.length > 1) {
    for (let c = 0; c < cols.length; c++) {
      for (let r = 1; r < rows.length; r++) {
        rowLengths.push({
          col: cols[c].label,
          from: rows[r - 1].label,
          to: rows[r].label,
          length: rows[r].position - rows[r - 1].position,
          beamId: rowBeamIds[(c * (rows.length - 1)) + (r - 1)] || "",
        });
      }
    }
  }

  // Consolidate segments by Beam ID
  const beamSummary: { beamId: string, segments: string[], totalLength: number }[] = [];
  beamIdList.forEach(beamId => {
    const segments: string[] = [];
    let totalLength = 0;
    // Check column segments
    colLengths.forEach((len, idx) => {
      if (colBeamIds[idx] === beamId) {
        segments.push(`${len.row}: ${len.from}-${len.to}`);
        totalLength += len.length;
      }
    });
    // Check row segments
    rowLengths.forEach((len, idx) => {
      if (rowBeamIds[idx] === beamId) {
        segments.push(`${len.col}: ${len.from}-${len.to}`);
        totalLength += len.length;
      }
    });
    if (segments.length > 0) {
      beamSummary.push({ beamId, segments, totalLength });
    }
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6 flex gap-8 items-center">
        <label className="font-semibold">Columns:</label>
        <input
          type="number"
          min={1}
          value={numCols}
          onChange={handleNumColsChange}
          className="border rounded px-2 w-16"
        />
        <label className="font-semibold">Rows:</label>
        <input
          type="number"
          min={1}
          value={numRows}
          onChange={handleNumRowsChange}
          className="border rounded px-2 w-16"
        />
      </div>
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Beam ID Segment Summary</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-zinc-200">
              <th className="p-2">Beam ID</th>
              <th className="p-2">Segments</th>
              <th className="p-2">Total Length (m)</th>
            </tr>
          </thead>
          <tbody>
            {beamSummary.map((row, idx) => (
              <tr key={idx}>
                <td className="p-2 font-bold">{row.beamId}</td>
                <td className="p-2">{row.segments.join(", ")}</td>
                <td className="p-2">{row.totalLength}</td>
              </tr>
            ))}
            {beamSummary.length === 0 && (
              <tr><td className="p-2" colSpan={3}>No segments assigned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold mb-6">Grid System Definition</h1>
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Define Beam IDs</h2>
        <div className="flex flex-col gap-2">
          {beamIdList.map((id, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              value={id}
              onChange={e => {
                const newList = [...beamIdList];
                newList[idx] = e.target.value;
                setBeamIdList(newList);
              }}
              className="border rounded px-2 w-16"
              placeholder={`Beam ID ${idx + 1}`}
            />
          </div>
        ))}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Columns (Grid X)</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-zinc-200">
                <th className="p-2">Label</th>
                <th className="p-2">X (m)</th>
              </tr>
            </thead>
            <tbody>
              {cols.map((col, idx) => (
                <tr key={col.label}>
                  <td className="p-2">
                    <input
                      value={col.label}
                      onChange={(e) => handleColChange(idx, "label", e.target.value)}
                      className="border rounded px-2 w-12"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={col.position}
                      onChange={(e) => handleColChange(idx, "position", e.target.value)}
                      className="border rounded px-2 w-16"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Rows (GridY)</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-zinc-200">
                <th className="p-2">Label</th>
                <th className="p-2">Y (m)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.label}>
                  <td className="p-2">
                    <input
                      value={row.label}
                      onChange={(e) => handleRowChange(idx, "label", e.target.value)}
                      className="border rounded px-2 w-12"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.position}
                      onChange={(e) => handleRowChange(idx, "position", e.target.value)}
                      className="border rounded px-2 w-16"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-8">
        <label className="block font-medium mb-2">Select Grid Coordinate</label>
        <select
          className="border rounded px-3 py-2 w-40"
          value={selectedCoord}
          onChange={(e) => setSelectedCoord(e.target.value)}
        >
          <option value="">-- Select --</option>
          {gridCoords.map((coord) => (
            <option key={coord} value={coord}>{coord}</option>
          ))}
        </select>
        {selectedPos && (
          <div className="mt-4 p-4 border rounded bg-zinc-100 dark:bg-zinc-900">
            <strong>Coordinate {selectedCoord}:</strong>
            <br />
            X = {selectedPos?.x ?? "-"} m, Y = {selectedPos?.y ?? "-"} m
          </div>
        )}
      </div>
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-2">Column Lengths (X)</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-zinc-200">
                <th className="p-2">Row</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Length (m)</th>
                <th className="p-2">Beam ID</th>
              </tr>
            </thead>
            <tbody>
              {colLengths.map((len, idx) => (
                <tr key={idx}>
                  <td className="p-2">{len.row}</td>
                  <td className="p-2">{len.from}</td>
                  <td className="p-2">{len.to}</td>
                  <td className="p-2">{len.length}</td>
                  <td className="p-2">
                    <select
                      value={len.beamId}
                      onChange={e => {
                        const updated = [...colBeamIds];
                        updated[idx] = e.target.value;
                        setColBeamIds(updated);
                      }}
                      className="border rounded px-2 w-24"
                    >
                      <option value="">Select Beam</option>
                      {beamIdList.map((id, i) => (
                        <option key={i} value={id}>{id}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Row Lengths (Y)</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-zinc-200">
                <th className="p-2">Column</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Length (m)</th>
                <th className="p-2">Beam ID</th>
              </tr>
            </thead>
            <tbody>
              {rowLengths.map((len, idx) => (
                <tr key={idx}>
                  <td className="p-2">{len.col}</td>
                  <td className="p-2">{len.from}</td>
                  <td className="p-2">{len.to}</td>
                  <td className="p-2">{len.length}</td>
                  <td className="p-2">
                    <select
                      value={len.beamId}
                      onChange={e => {
                        const updated = [...rowBeamIds];
                        updated[idx] = e.target.value;
                        setRowBeamIds(updated);
                      }}
                      className="border rounded px-2 w-24"
                    >
                      <option value="">Select Beam</option>
                      {beamIdList.map((id, i) => (
                        <option key={i} value={id}>{id}</option>
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
  );
}
