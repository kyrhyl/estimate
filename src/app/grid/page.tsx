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
  const calculateReinforcementWeights = (beam: BeamSpec) => {
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
  const [activeTab, setActiveTab] = useState<'beams' | 'grid'>('beams');
  const [beamSpecs, setBeamSpecs] = useState<BeamSpec[]>([
    { id: "B1", width: 0.3, depth: 0.5, topBarSize: 12, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 12, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 },
    { id: "B2", width: 0.3, depth: 0.6, topBarSize: 12, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 12, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 8 },
    { id: "B3", width: 0.25, depth: 0.4, topBarSize: 10, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 10, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 },
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
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
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
            >
              Grid System & Assignment
            </button>
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
      </div>
    </div>
  );
}
