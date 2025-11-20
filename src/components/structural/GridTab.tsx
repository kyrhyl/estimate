import { BeamSpec, ColumnSpec, Floor, SlabSpec, SlabAssignment } from './types';
import { calculateReinforcementWeights, calculateColumnReinforcementWeights } from './utils';
import SlabAssignmentTab from './SlabAssignmentTab';

interface GridTabProps {
  numCols: number;
  numRows: number;
  cols: Array<{ label: string; position: number }>;
  rows: Array<{ label: string; position: number }>;
  colBeamIds: string[];
  rowBeamIds: string[];
  columnIds: string[];
  beamSpecs: BeamSpec[];
  columnSpecs: ColumnSpec[];
  slabSpecs?: SlabSpec[];
  slabAssignments?: SlabAssignment[];
  setSlabAssignments?: (assignments: SlabAssignment[]) => void;
  handleNumColsChange: (newNumCols: number) => void;
  handleNumRowsChange: (newNumRows: number) => void;
  handleColChange: (idx: number, field: "label" | "position", value: string | number) => void;
  handleRowChange: (idx: number, field: "label" | "position", value: string | number) => void;
  setColBeamIds: (ids: string[]) => void;
  setRowBeamIds: (ids: string[]) => void;
  updateCurrentFloor: (updates: Partial<Floor>) => void;
}

export default function GridTab({
  numCols,
  numRows,
  cols,
  rows,
  colBeamIds,
  rowBeamIds,
  columnIds,
  beamSpecs,
  columnSpecs,
  slabSpecs = [],
  slabAssignments = [],
  setSlabAssignments,
  handleNumColsChange,
  handleNumRowsChange,
  handleColChange,
  handleRowChange,
  setColBeamIds,
  setRowBeamIds,
  updateCurrentFloor,
}: GridTabProps) {
  // Calculate lengths between adjacent columns for each row
  const colLengths: { row: string, from: string, to: string, length: number, effectiveLength: number, beamId: string, segment: string }[] = [];
  if (cols && cols.length > 1 && rows && rows.length > 0) {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 1; c < cols.length; c++) {
        const centerLength = Math.abs((cols[c]?.position || 0) - (cols[c - 1]?.position || 0));
        
        // Calculate effective length considering column widths
        const startColIndex = r * cols.length + (c - 1);
        const endColIndex = r * cols.length + c;
        const startColumnId = columnIds[startColIndex];
        const endColumnId = columnIds[endColIndex];
        
        let startColWidth = 0;
        let endColWidth = 0;
        
        if (startColumnId) {
          const startCol = columnSpecs.find(col => col.id === startColumnId);
          if (startCol) startColWidth = startCol.width;
        }
        if (endColumnId) {
          const endCol = columnSpecs.find(col => col.id === endColumnId);
          if (endCol) endColWidth = endCol.width;
        }
        
        const effectiveLength = Math.max(0, centerLength - (startColWidth / 2 + endColWidth / 2));
        
        colLengths.push({
          row: rows[r]?.label || '',
          from: cols[c - 1]?.label || '',
          to: cols[c]?.label || '',
          length: centerLength,
          effectiveLength,
          beamId: colBeamIds[(r * (cols.length - 1)) + (c - 1)] || "",
          segment: `${rows[r]?.label || ''}${cols[c - 1]?.label || ''}-${rows[r]?.label || ''}${cols[c]?.label || ''}`,
        });
      }
    }
  }

  // Calculate lengths between adjacent rows for each column
  const rowLengths: { col: string, from: string, to: string, length: number, effectiveLength: number, beamId: string, segment: string }[] = [];
  if (rows && rows.length > 1 && cols && cols.length > 0) {
    for (let c = 0; c < cols.length; c++) {
      for (let r = 1; r < rows.length; r++) {
        const centerLength = Math.abs((rows[r]?.position || 0) - (rows[r - 1]?.position || 0));
        
        // Calculate effective length considering column depths
        const startColIndex = (r - 1) * cols.length + c;
        const endColIndex = r * cols.length + c;
        const startColumnId = columnIds[startColIndex];
        const endColumnId = columnIds[endColIndex];
        
        let startColDepth = 0;
        let endColDepth = 0;
        
        if (startColumnId) {
          const startCol = columnSpecs.find(col => col.id === startColumnId);
          if (startCol) startColDepth = startCol.depth;
        }
        if (endColumnId) {
          const endCol = columnSpecs.find(col => col.id === endColumnId);
          if (endCol) endColDepth = endCol.depth;
        }
        
        const effectiveLength = Math.max(0, centerLength - (startColDepth / 2 + endColDepth / 2));
        
        rowLengths.push({
          col: cols[c]?.label || '',
          from: rows[r - 1]?.label || '',
          to: rows[r]?.label || '',
          length: centerLength,
          effectiveLength,
          beamId: rowBeamIds[(c * (rows.length - 1)) + (r - 1)] || "",
          segment: `${rows[r - 1]?.label || ''}${cols[c]?.label || ''}-${rows[r]?.label || ''}${cols[c]?.label || ''}`,
        });
      }
    }
  }

  return (
    <div>
      {/* Grid System Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Grid System & Assignment</h2>
        <p className="text-gray-600">Configure grid layout and assign beam types to grid segments</p>
      </div>

      {/* Grid Configuration and Summary Layout */}
      <div className="flex gap-8 mb-8">
        {/* Grid Size Configuration - 10% width */}
        <div className="w-[10%] bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Grid</h3>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Number of Rows
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={numRows}
                onChange={(e) => handleNumRowsChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Number of Columns
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={numCols}
                onChange={(e) => handleNumColsChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
          </div>
        </div>

        {/* Summaries Column - Takes up 90% width */}
        <div className="flex-1 space-y-6">
          {/* Beam Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Beam Summary</h3>
            <p className="text-gray-600 mb-4">Quantity overview of beam usage on this floor</p>
          
          {(() => {
            // Calculate beam summary
            const beamSummaryMap = new Map();
            
            // Aggregate beam data
            [...colLengths, ...rowLengths].forEach(({ beamId, effectiveLength, segment }) => {
              if (beamId && !beamSummaryMap.has(beamId)) {
                beamSummaryMap.set(beamId, { segments: [], totalLength: 0 });
              }
              if (beamId) {
                const summary = beamSummaryMap.get(beamId);
                summary.segments.push(segment);
                summary.totalLength += effectiveLength;
              }
            });

            return (
              <div>
                {beamSummaryMap.size > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Beam ID</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Segments</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Count</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Total Length (m)</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Concrete (m³)</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Grade 40 (kg)</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Grade 60 (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(beamSummaryMap.entries()).map(([beamId, summary]) => {
                          const beam = beamSpecs.find(b => b.id === beamId);
                          if (!beam) return null;
                          
                          const concreteVolume = summary.totalLength * beam.width * beam.depth;
                          const weights = calculateReinforcementWeights(beam);
                          const grade40Steel = weights.grade40Weight * summary.totalLength;
                          const grade60Steel = weights.grade60Weight * summary.totalLength;
                          
                          return (
                            <tr key={beamId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-blue-600">{beamId}</td>
                              <td className="py-3 px-4 text-center text-sm text-gray-600">
                                {summary.segments.join(', ')}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-semibold text-blue-600">
                                {summary.segments.length}
                              </td>
                              <td className="py-3 px-4 text-center font-mono">{summary.totalLength.toFixed(1)}</td>
                              <td className="py-3 px-4 text-center font-mono">{concreteVolume.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center font-mono text-orange-600">
                                {grade40Steel.toFixed(1)}
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-red-600">
                                {grade60Steel.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-900">TOTALS</td>
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4 text-center font-bold text-blue-600">
                            {Array.from(beamSummaryMap.values()).reduce((sum, summary) => sum + summary.segments.length, 0)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {Array.from(beamSummaryMap.values()).reduce((sum, summary) => sum + summary.totalLength, 0).toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            {Array.from(beamSummaryMap.entries()).reduce((sum, [beamId, summary]) => {
                              const beam = beamSpecs.find(b => b.id === beamId);
                              return sum + (beam ? summary.totalLength * beam.width * beam.depth : 0);
                            }, 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-orange-600">
                            {Array.from(beamSummaryMap.entries()).reduce((sum, [beamId, summary]) => {
                              const beam = beamSpecs.find(b => b.id === beamId);
                              if (!beam) return sum;
                              const weights = calculateReinforcementWeights(beam);
                              return sum + weights.grade40Weight * summary.totalLength;
                            }, 0).toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-red-600">
                            {Array.from(beamSummaryMap.entries()).reduce((sum, [beamId, summary]) => {
                              const beam = beamSpecs.find(b => b.id === beamId);
                              if (!beam) return sum;
                              const weights = calculateReinforcementWeights(beam);
                              return sum + weights.grade60Weight * summary.totalLength;
                            }, 0).toFixed(1)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No beams assigned to grid segments yet.</p>
                  </div>
                )}
              </div>
            );
          })()}
          </div>

          {/* Column Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Column Summary</h3>
            <p className="text-gray-600 mb-4">Quantity overview of column usage on this floor</p>
            
            {(() => {
              // Calculate column summary
              const columnSummaryMap = new Map();
              
              columnIds.forEach((columnId, index) => {
                if (columnId && columnId.trim() !== "") {
                  const rowIndex = Math.floor(index / numCols);
                  const colIndex = index % numCols;
                  const location = `${rows[rowIndex]?.label || 'Unknown'}${cols[colIndex]?.label || 'Unknown'}`;
                  
                  if (!columnSummaryMap.has(columnId)) {
                    columnSummaryMap.set(columnId, { locations: [], count: 0 });
                  }
                  const summary = columnSummaryMap.get(columnId);
                  summary.locations.push(location);
                  summary.count += 1;
                }
              });

              return (
                <div>
                  {columnSummaryMap.size > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Column ID</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">Locations</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">Count</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">Concrete (m³)</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">Grade 40 (kg)</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-900">Grade 60 (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(columnSummaryMap.entries()).map(([columnId, summary]) => {
                            const column = columnSpecs.find(c => c.id === columnId);
                            if (!column) return null;
                            
                            const singleColumnConcreteVolume = column.width * column.depth * column.height;
                            const totalConcreteVolume = singleColumnConcreteVolume * summary.count;
                            const weights = calculateColumnReinforcementWeights(column);
                            const totalGrade40Steel = weights.grade40Weight * summary.count;
                            const totalGrade60Steel = weights.grade60Weight * summary.count;
                            
                            return (
                              <tr key={columnId} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-green-600">{columnId}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                  {summary.locations.join(', ')}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-semibold text-green-600">
                                  {summary.count}
                                </td>
                                <td className="py-3 px-4 text-center font-mono">{totalConcreteVolume.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center font-mono text-orange-600">
                                  {totalGrade40Steel.toFixed(1)}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-red-600">
                                  {totalGrade60Steel.toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 bg-gray-50">
                            <td className="py-3 px-4 font-bold text-gray-900">TOTALS</td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 text-center font-bold text-green-600">
                              {Array.from(columnSummaryMap.values()).reduce((sum, summary) => sum + summary.count, 0)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold">
                              {Array.from(columnSummaryMap.entries()).reduce((sum, [columnId, summary]) => {
                                const column = columnSpecs.find(c => c.id === columnId);
                                return sum + (column ? column.width * column.depth * column.height * summary.count : 0);
                              }, 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-orange-600">
                              {Array.from(columnSummaryMap.entries()).reduce((sum, [columnId, summary]) => {
                                const column = columnSpecs.find(c => c.id === columnId);
                                if (!column) return sum;
                                const weights = calculateColumnReinforcementWeights(column);
                                return sum + weights.grade40Weight * summary.count;
                              }, 0).toFixed(1)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-red-600">
                              {Array.from(columnSummaryMap.entries()).reduce((sum, [columnId, summary]) => {
                                const column = columnSpecs.find(c => c.id === columnId);
                                if (!column) return sum;
                                const weights = calculateColumnReinforcementWeights(column);
                                return sum + weights.grade60Weight * summary.count;
                              }, 0).toFixed(1)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No columns assigned to grid intersections yet.</p>
                    </div>
                  )}
                </div>
              );
            })()}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Column Beams (X Direction)</h3>
            <button
              onClick={() => {
                setColBeamIds(Array(colBeamIds.length).fill(""));
                setRowBeamIds(Array(rowBeamIds.length).fill(""));
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear All Beams
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Center-Center (m)</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Effective Span (m)</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Beam ID</th>
                </tr>
              </thead>
              <tbody>
                {colLengths.map((len, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="p-2 text-center">{len.row}</td>
                    <td className="p-2 text-center">{len.from}</td>
                    <td className="p-2 text-center">{len.to}</td>
                    <td className="p-2 text-center font-mono">{len.length.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-blue-600 font-semibold">{len.effectiveLength.toFixed(2)}</td>
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
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Center-Center (m)</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Effective Span (m)</th>
                  <th className="p-2 text-center text-xs font-medium text-gray-500 uppercase">Beam ID</th>
                </tr>
              </thead>
              <tbody>
                {rowLengths.map((len, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="p-2 text-center">{len.col}</td>
                    <td className="p-2 text-center">{len.from}</td>
                    <td className="p-2 text-center">{len.to}</td>
                    <td className="p-2 text-center font-mono">{len.length.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-blue-600 font-semibold">{len.effectiveLength.toFixed(2)}</td>
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

      {/* Column Assignment Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Column Assignment</h3>
        <p className="text-gray-600 mb-4">Assign column types to grid intersections</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid gap-3" style={{
            gridTemplateColumns: `repeat(${numCols}, 1fr)`,
            gridTemplateRows: `repeat(${numRows}, 1fr)`
          }}>
            {Array.from({ length: numRows }, (_, r) => 
              Array.from({ length: numCols }, (_, c) => {
                const index = r * numCols + c;
                return (
                  <div key={`${r}-${c}`} className="flex flex-col items-center space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      {rows[r]?.label || 'Unknown'}{cols[c]?.label || 'Unknown'}
                    </div>
                    <select
                      value={columnIds[index] || ""}
                      onChange={(e) => {
                        const newColumnIds = [...columnIds];
                        newColumnIds[index] = e.target.value;
                        updateCurrentFloor({ columnIds: newColumnIds });
                      }}
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">-</option>
                      {columnSpecs.map(column => (
                        <option key={column.id} value={column.id}>{column.id}</option>
                      ))}
                    </select>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Slab Assignment Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Slab Assignment</h3>
        <p className="text-gray-600 mb-4">Assign slab types to grid areas</p>

        {setSlabAssignments && (
          <SlabAssignmentTab
            slabAssignments={slabAssignments}
            setSlabAssignments={setSlabAssignments}
            slabSpecs={slabSpecs}
            rows={rows}
            cols={cols}
          />
        )}
      </div>
    </div>
  );
}