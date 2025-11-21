import { SlabAssignment, SlabSpec } from './types';
import { calculateSlabReinforcementWeights, calculateSlabConcreteVolume, calculateGridArea, calculateTotalSlabArea, formatNumber } from './utils';

interface SlabAssignmentTabProps {
  slabAssignments: SlabAssignment[];
  setSlabAssignments: (assignments: SlabAssignment[]) => void;
  slabSpecs: SlabSpec[];
  rows: Array<{ label: string; position: number }>;
  cols: Array<{ label: string; position: number }>;
}

export default function SlabAssignmentTab({
  slabAssignments,
  setSlabAssignments,
  slabSpecs,
  rows,
  cols
}: SlabAssignmentTabProps) {
  // Calculate area for a grid span using the utility function
  const calculateArea = (startRow: string, endRow: string, startCol: string, endCol: string): number => {
    const result = calculateGridArea(startRow, endRow, startCol, endCol, rows, cols);
    return result.isValid ? result.area : 0;
  };

  // Get assigned areas for visualization
  const getAssignedAreas = () => {
    const assignments: { [key: string]: string } = {};
    slabAssignments.forEach(assignment => {
      for (let r = rows.findIndex(row => row.label === assignment.startRow);
           r <= rows.findIndex(row => row.label === assignment.endRow);
           r++) {
        for (let c = cols.findIndex(col => col.label === assignment.startCol);
             c <= cols.findIndex(col => col.label === assignment.endCol);
             c++) {
          const key = `${rows[r]?.label}${cols[c]?.label}`;
          assignments[key] = assignment.slabSpecId;
        }
      }
    });
    return assignments;
  };

  const assignedAreas = getAssignedAreas();

  // Handle cell click to clear assignment
  const handleCellClick = (cellKey: string) => {
    const slabSpecId = assignedAreas[cellKey];
    if (!slabSpecId) return; // No assignment to clear

    // Find the assignment that covers this cell
    const assignmentToRemove = slabAssignments.find(assignment => {
      const startRowIdx = rows.findIndex(r => r.label === assignment.startRow);
      const endRowIdx = rows.findIndex(r => r.label === assignment.endRow);
      const startColIdx = cols.findIndex(c => c.label === assignment.startCol);
      const endColIdx = cols.findIndex(c => c.label === assignment.endCol);
      const cellRowIdx = rows.findIndex(r => r.label === cellKey.charAt(0));
      const cellColIdx = cols.findIndex(c => c.label === cellKey.substring(1));

      return cellRowIdx >= startRowIdx && cellRowIdx <= endRowIdx &&
             cellColIdx >= startColIdx && cellColIdx <= endColIdx;
    });

    if (assignmentToRemove) {
      const newAssignments = slabAssignments.filter(assignment => assignment.id !== assignmentToRemove.id);
      setSlabAssignments(newAssignments);
    }
  };
  const handleDragStart = (e: React.DragEvent, slabSpecId: string) => {
    e.dataTransfer.setData('text/plain', slabSpecId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    const slabSpecId = e.dataTransfer.getData('text/plain');

    if (!slabSpecId) return;

    // Extract row and column from cell key (e.g., "A1" -> row: "A", col: "1")
    const row = cellKey.charAt(0);
    const col = cellKey.substring(1);

    // Check if this cell is already assigned
    const existingAssignment = slabAssignments.find(assignment => {
      const startRowIdx = rows.findIndex(r => r.label === assignment.startRow);
      const endRowIdx = rows.findIndex(r => r.label === assignment.endRow);
      const startColIdx = cols.findIndex(c => c.label === assignment.startCol);
      const endColIdx = cols.findIndex(c => c.label === assignment.endCol);
      const cellRowIdx = rows.findIndex(r => r.label === row);
      const cellColIdx = cols.findIndex(c => c.label === col);

      return cellRowIdx >= startRowIdx && cellRowIdx <= endRowIdx &&
             cellColIdx >= startColIdx && cellColIdx <= endColIdx;
    });

    if (existingAssignment) {
      // Update existing assignment
      const newAssignments = slabAssignments.map(assignment =>
        assignment.id === existingAssignment.id
          ? { ...assignment, slabSpecId }
          : assignment
      );
      setSlabAssignments(newAssignments);
    } else {
      // Create new single-cell assignment
      const area = calculateArea(row, row, col, col);
      const newAssignment: SlabAssignment = {
        id: `SA${Date.now()}`, // Use timestamp for unique ID
        slabSpecId,
        startRow: row,
        endRow: row,
        startCol: col,
        endCol: col,
        area
      };
      setSlabAssignments([...slabAssignments, newAssignment]);
    }
  };

  return (
    <div>
      {/* Slab Assignment Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Slab Assignment</h2>
        <p className="text-gray-600">Drag slab specifications onto grid areas to assign them. Click assigned cells to clear assignments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Slab Specs Palette */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Slab Specifications</h3>
          <p className="text-sm text-gray-600 mb-4">Drag these onto the grid to assign</p>
          <div className="space-y-2">
            {slabSpecs.map((slab) => (
              <div
                key={slab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slab.id)}
                className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-colors duration-200 text-center font-medium ${
                  slab.type === 'two-way'
                    ? 'bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-800'
                    : 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-800'
                }`}
                title={`${slab.id} (${slab.type})`}
              >
                {slab.id}
              </div>
            ))}
            {slabSpecs.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No slab specs available
              </div>
            )}
          </div>
        </div>

        {/* Grid Visualization */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grid Layout</h3>
          <p className="text-sm text-gray-600 mb-4">Drop slab specs here to assign them to areas</p>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column headers */}
              <div className="flex gap-3 mb-4">
                <div className="w-12"></div> {/* Empty corner */}
                {cols.map(col => (
                  <div key={col.label} className="w-12 h-8 flex items-center justify-center bg-blue-100 border border-blue-200 rounded text-xs font-medium text-blue-800">
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {rows.map(row => (
                <div key={row.label} className="flex items-center gap-3 mb-4">
                  {/* Row header */}
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 border border-green-200 rounded text-xs font-medium text-green-800">
                    {row.label}
                  </div>

                  {/* Grid cells */}
                  {cols.map(col => {
                    const cellKey = `${row.label}${col.label}`;
                    const slabSpecId = assignedAreas[cellKey];
                    const slabSpec = slabSpecs.find(s => s.id === slabSpecId);

                    return (
                      <div
                        key={cellKey}
                        onClick={() => handleCellClick(cellKey)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, cellKey)}
                        className={`w-12 h-12 border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                          slabSpecId
                            ? `bg-${slabSpec?.type === 'two-way' ? 'purple' : 'blue'}-100 border-${slabSpec?.type === 'two-way' ? 'purple' : 'blue'}-300 text-${slabSpec?.type === 'two-way' ? 'purple' : 'blue'}-800 hover:bg-${slabSpec?.type === 'two-way' ? 'purple' : 'blue'}-200 cursor-pointer`
                            : 'bg-gray-50 border-gray-200 border-dashed text-gray-400 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                        title={slabSpec ? `${slabSpec.id} (${slabSpec.type}) - Click to clear` : 'Drop slab spec here'}
                      >
                        {slabSpecId || '+'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 border-dashed mr-2"></div>
              <span>Unassigned (drop zone)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 mr-2"></div>
              <span>One-Way Slab (click to clear)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 mr-2"></div>
              <span>Two-Way Slab (click to clear)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Slab Specification Summary</h3>
        {slabAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slab Spec
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Area (m²)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Volume (m³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade 40 Total (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade 60 Total (kg)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slabSpecs
                  .filter(slabSpec => slabAssignments.some(assignment => assignment.slabSpecId === slabSpec.id))
                  .map((slabSpec) => {
                    const slabAssignmentsForSpec = slabAssignments.filter(assignment => assignment.slabSpecId === slabSpec.id);
                    const totalArea = calculateTotalSlabArea(slabAssignments, slabSpec.id);
                    const unitVolume = slabSpec.thickness / 1000; // Convert mm to meters (volume per m²)
                    const totalVolume = calculateSlabConcreteVolume(slabSpec, totalArea);
                    const steelWeights = calculateSlabReinforcementWeights(slabSpec);
                    const grade40PerSqm = steelWeights.grade40Weight; // Already per m²
                    const grade60PerSqm = steelWeights.grade60Weight; // Already per m²

                    return (
                      <tr key={slabSpec.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {slabSpec.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slabSpec.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slabAssignmentsForSpec.length} location{slabAssignmentsForSpec.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(totalArea, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(totalVolume, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(grade40PerSqm * totalArea, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(grade60PerSqm * totalArea, 2)}
                        </td>
                      </tr>
                    );
                  })}
                {/* Grand Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={3}>
                    GRAND TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(slabAssignments.reduce((sum, assignment) => sum + assignment.area, 0), 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(slabAssignments.reduce((sum, assignment) => {
                      const slabSpec = slabSpecs.find(s => s.id === assignment.slabSpecId);
                      return sum + (slabSpec ? calculateSlabConcreteVolume(slabSpec, assignment.area) : 0);
                    }, 0), 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(slabAssignments.reduce((sum, assignment) => {
                      const slabSpec = slabSpecs.find(s => s.id === assignment.slabSpecId);
                      const steelWeights = slabSpec ? calculateSlabReinforcementWeights(slabSpec) : { grade40Weight: 0, grade60Weight: 0, totalWeight: 0 };
                      return sum + (steelWeights.grade40Weight * assignment.area);
                    }, 0), 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(slabAssignments.reduce((sum, assignment) => {
                      const slabSpec = slabSpecs.find(s => s.id === assignment.slabSpecId);
                      const steelWeights = slabSpec ? calculateSlabReinforcementWeights(slabSpec) : { grade40Weight: 0, grade60Weight: 0, totalWeight: 0 };
                      return sum + (steelWeights.grade60Weight * assignment.area);
                    }, 0), 2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No slab assignments yet. Drag slab specifications onto the grid above.
          </div>
        )}
      </div>
    </div>
  );
}