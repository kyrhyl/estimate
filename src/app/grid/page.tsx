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
          arr.push({ label: String(arr.length + 1), position: arr.length * 5 });
        }
        return arr.slice(0, value);
      });
      // Adjust colBeamIds
      setColBeamIds(Array(numRows * (value - 1)).fill(""));
    };

    // Handler to update number of rows
    const handleNumRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(1, Number(e.target.value));
      setNumRows(value);
      // Adjust rows array
      setRows(prev => {
        const arr = [...prev];
        while (arr.length < value) {
          arr.push({ label: String.fromCharCode(65 + arr.length), position: arr.length * 4 });
        }
        return arr.slice(0, value);
      });
      // Adjust rowBeamIds
      setRowBeamIds(Array(numCols * (value - 1)).fill(""));
    };
  const [numCols, setNumCols] = useState(4);
     const [numRows, setNumRows] = useState(3);
  const [cols, setCols] = useState([
    { label: "1", position: 0 },
    { label: "2", position: 5 },
    { label: "3", position: 10 },
  ]);
  const [rows, setRows] = useState([
       { label: "A", position: 0 },
       { label: "B", position: 4 },
       { label: "C", position: 8 },
  ]);
  const [selectedCoord, setSelectedCoord] = useState("");
  // User-defined Beam IDs and their properties
  type BeamSpec = { id: string; width: number; depth: number };
  const [beamSpecs, setBeamSpecs] = useState<BeamSpec[]>([
    { id: "B1", width: 0.3, depth: 0.5 },
    { id: "B2", width: 0.3, depth: 0.6 },
    { id: "B3", width: 0.25, depth: 0.4 },
  ]);
  // Selected Beam IDs for each length
  const [colBeamIds, setColBeamIds] = useState(Array(rows.length * (cols.length - 1)).fill(""));
  const [rowBeamIds, setRowBeamIds] = useState(Array(cols.length * (rows.length - 1)).fill(""));

  const handleColChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...cols];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setCols(updated);
    // Ensure colBeamIds and rowBeamIds stay in sync with grid size
    setColBeamIds(prev => {
      const needed = numRows * (updated.length - 1);
      const arr = [...prev];
      while (arr.length < needed) arr.push("");
      return arr.slice(0, needed);
    });
    setRowBeamIds(prev => {
      const needed = updated.length * (numRows - 1);
      const arr = [...prev];
      while (arr.length < needed) arr.push("");
      return arr.slice(0, needed);
    });
  };
  const handleRowChange = (idx: number, field: "label" | "position", value: string | number) => {
    const updated = [...rows];
    (updated[idx] as any)[field] = field === "position" ? Number(value) : value;
    setRows(updated);
    // Ensure colBeamIds and rowBeamIds stay in sync with grid size
    setColBeamIds(prev => {
      const needed = updated.length * (cols.length - 1);
      const arr = [...prev];
      while (arr.length < needed) arr.push("");
      return arr.slice(0, needed);
    });
    setRowBeamIds(prev => {
      const needed = cols.length * (updated.length - 1);
      const arr = [...prev];
      while (arr.length < needed) arr.push("");
      return arr.slice(0, needed);
    });
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
        <h2 className="font-semibold mb-2">Beam Segment & Volume Summary</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-zinc-200">
              <th className="p-2">Beam ID</th>
              <th className="p-2">Width (m)</th>
              <th className="p-2">Depth (m)</th>
              <th className="p-2">Vol/m (m³)</th>
              <th className="p-2">Segments</th>
              <th className="p-2">Total Length (m)</th>
              <th className="p-2">Total Volume (m³)</th>
            </tr>
          </thead>
          <tbody>
            {beamSummary.map((row, idx) => (
              <tr key={idx}>
                <td className="p-2 font-bold">{row.beamId}</td>
                <td className="p-2">{row.width}</td>
                <td className="p-2">{row.depth}</td>
                <td className="p-2">{row.volumePerMeter.toFixed(3)}</td>
                <td className="p-2">{row.segments.join(", ")}</td>
                <td className="p-2">{row.totalLength}</td>
                <td className="p-2">{(row.totalLength * row.volumePerMeter).toFixed(3)}</td>
              </tr>
            ))}
            {beamSummary.length === 0 && (
              <tr><td className="p-2" colSpan={7}>No segments assigned yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <h1 className="text-2xl font-bold mb-6">Grid System Definition</h1>
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Define Beam Specifications</h2>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {beamSpecs.map((beam, idx) => (
              <div key={idx} className="border rounded-md p-2 shadow bg-white dark:bg-zinc-900 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold mb-0.5">{beam.id || `Beam ${idx + 1}`}</div>
                    <div className="text-[11px] text-zinc-500">Spec</div>
                  </div>
                  <button
                    type="button"
                    className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded text-xs"
                    onClick={() => {
                      const newSpecs = beamSpecs.filter((_, i) => i !== idx);
                      setBeamSpecs(newSpecs);
                    }}
                  >Delete</button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1 items-center text-sm">
                  <label className="text-[11px] text-zinc-600">ID</label>
                  <input
                    value={beam.id}
                    onChange={e => {
                      const newSpecs = [...beamSpecs];
                      newSpecs[idx].id = e.target.value;
                      setBeamSpecs(newSpecs);
                    }}
                    className="border rounded px-2 py-1 text-sm w-full"
                    placeholder={`Beam ID ${idx + 1}`}
                  />

                  <label className="text-[11px] text-zinc-600">W (m)</label>
                  <input
                    type="number"
                    value={beam.width}
                    min={0.01}
                    step={0.01}
                    onChange={e => {
                      const newSpecs = [...beamSpecs];
                      newSpecs[idx].width = Number(e.target.value);
                      setBeamSpecs(newSpecs);
                    }}
                    className="border rounded px-2 py-1 text-sm w-full"
                    placeholder="Width"
                  />

                  <label className="text-[11px] text-zinc-600">D (m)</label>
                  <input
                    type="number"
                    value={beam.depth}
                    min={0.01}
                    step={0.01}
                    onChange={e => {
                      const newSpecs = [...beamSpecs];
                      newSpecs[idx].depth = Number(e.target.value);
                      setBeamSpecs(newSpecs);
                    }}
                    className="border rounded px-2 py-1 text-sm w-full"
                    placeholder="Depth"
                  />

                  <label className="text-[11px] text-zinc-600">Vol/m</label>
                  <div className="text-sm">{(beam.width * beam.depth).toFixed(3)} m³</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              onClick={() => {
                setBeamSpecs([...beamSpecs, { id: `B${beamSpecs.length + 1}`, width: 0.3, depth: 0.5 }]);
              }}
            >Add Beam</button>
          </div>
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
  );
}
