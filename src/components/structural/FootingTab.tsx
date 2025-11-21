"use client";
import { FootingSpec, FootingAssignment } from './types';
import { BAR_SIZES } from './utils';
import { calculateFootingReinforcementWeights, calculateFootingConcreteVolume, formatNumber } from './utils';

interface FootingTabProps {
  footingSpecs: FootingSpec[];
  footingAssignments: FootingAssignment[];
  setFootingSpecs: (specs: FootingSpec[]) => void;
  setFootingAssignments: (assignments: FootingAssignment[]) => void;
  rows?: Array<{ label: string; position: number }>;
  cols?: Array<{ label: string; position: number }>;
}

export default function FootingTab({ footingSpecs, footingAssignments, setFootingSpecs, setFootingAssignments, rows = [], cols = [] }: FootingTabProps) {
  // Get assigned areas for visualization
  const getAssignedAreas = () => {
    const assignments: { [key: string]: string } = {};
    footingAssignments.forEach(assignment => {
      assignments[assignment.gridPosition] = assignment.footingSpecId;
    });
    return assignments;
  };

  const assignedAreas = getAssignedAreas();

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, footingSpecId: string) => {
    e.dataTransfer.setData('text/plain', footingSpecId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    const footingSpecId = e.dataTransfer.getData('text/plain');

    if (!footingSpecId) return;

    // Check if this cell is already assigned
    const existingAssignment = footingAssignments.find(assignment => assignment.gridPosition === cellKey);

    if (existingAssignment) {
      // Update existing assignment
      const newAssignments = footingAssignments.map(assignment =>
        assignment.gridPosition === cellKey
          ? { ...assignment, footingSpecId }
          : assignment
      );
      setFootingAssignments(newAssignments);
    } else {
      // Create new assignment
      const newAssignment: FootingAssignment = {
        footingSpecId,
        gridPosition: cellKey,
      };
      setFootingAssignments([...footingAssignments, newAssignment]);
    }
  };

  // Handle cell click to clear assignment
  const handleCellClick = (cellKey: string) => {
    const newAssignments = footingAssignments.filter(a => a.gridPosition !== cellKey);
    setFootingAssignments(newAssignments);
  };
  return (
    <div>
      {/* Footing Specifications Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Footing Specifications</h2>
        <p className="text-gray-600">Configure footing dimensions and reinforcement details</p>
      </div>

      {/* Footing Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-8">
        {footingSpecs.map((footing) => (
          <div key={footing.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={footing.id}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const isDuplicate = footingSpecs.some(f => f.id === newValue && f !== footing);
                      if (!isDuplicate) {
                        const newSpecs = footingSpecs.map(f =>
                          f.id === footing.id ? { ...f, id: newValue } : f
                        );
                        setFootingSpecs(newSpecs);
                      }
                    }}
                    className="text-xl font-semibold bg-transparent border-b border-green-300 border-opacity-50 text-white placeholder-green-200 focus:outline-none focus:border-white w-full"
                    placeholder="Footing Name"
                    suppressHydrationWarning={true}
                  />
                  <p className="text-green-100 text-sm mt-1">Footing Configuration</p>
                </div>
                <button
                  onClick={() => {
                    const newSpecs = footingSpecs.filter(f => f.id !== footing.id);
                    setFootingSpecs(newSpecs);
                  }}
                  className="ml-4 p-2 hover:bg-red-600 rounded-md transition-colors duration-200 group"
                  suppressHydrationWarning={true}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Footing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footing Type</label>
                <select
                  value={footing.type}
                  onChange={(e) => {
                    const newSpecs = footingSpecs.map(f =>
                      f.id === footing.id ? { ...f, type: e.target.value as FootingSpec['type'] } : f
                    );
                    setFootingSpecs(newSpecs);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="isolated">Isolated Footing</option>
                  <option value="combined">Combined Footing</option>
                  <option value="strip">Strip Footing</option>
                  <option value="raft">Raft Footing</option>
                </select>
              </div>

              {/* Dimensions Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Dimensions (meters)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={footing.width}
                      onChange={(e) => {
                        const newSpecs = footingSpecs.map(f =>
                          f.id === footing.id ? { ...f, width: parseFloat(e.target.value) || 0 } : f
                        );
                        setFootingSpecs(newSpecs);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={footing.length}
                      onChange={(e) => {
                        const newSpecs = footingSpecs.map(f =>
                          f.id === footing.id ? { ...f, length: parseFloat(e.target.value) || 0 } : f
                        );
                        setFootingSpecs(newSpecs);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Thickness</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={footing.depth}
                      onChange={(e) => {
                        const newSpecs = footingSpecs.map(f =>
                          f.id === footing.id ? { ...f, depth: parseFloat(e.target.value) || 0 } : f
                        );
                        setFootingSpecs(newSpecs);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reinforcement Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Reinforcement
                </h4>
                <div className="space-y-4">
                  {/* Main Bars */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Main Bar Size</label>
                      <select
                        value={footing.mainBarSize}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, mainBarSize: parseInt(e.target.value) } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {BAR_SIZES.map(size => (
                          <option key={size} value={size}>{size}mm</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Spacing (mm)</label>
                      <input
                        type="number"
                        min="50"
                        max="500"
                        step="25"
                        value={footing.mainBarSpacing}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, mainBarSpacing: parseInt(e.target.value) || 150 } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Distribution Bars */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Dist. Bar Size</label>
                      <select
                        value={footing.distributionBarSize}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, distributionBarSize: parseInt(e.target.value) } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {BAR_SIZES.map(size => (
                          <option key={size} value={size}>{size}mm</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Spacing (mm)</label>
                      <input
                        type="number"
                        min="50"
                        max="500"
                        step="25"
                        value={footing.distributionBarSpacing}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, distributionBarSpacing: parseInt(e.target.value) || 200 } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Stirrups */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Stirrup Size</label>
                      <select
                        value={footing.stirrupSize}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, stirrupSize: parseInt(e.target.value) } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {BAR_SIZES.map(size => (
                          <option key={size} value={size}>{size}mm</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Spacing (m)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        max="1.0"
                        value={footing.stirrupSpacing}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, stirrupSpacing: parseFloat(e.target.value) || 0.15 } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Top Bars Option */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={`topBars-${footing.id}`}
                        checked={footing.topBarsRequired}
                        onChange={(e) => {
                          const newSpecs = footingSpecs.map(f =>
                            f.id === footing.id ? { ...f, topBarsRequired: e.target.checked } : f
                          );
                          setFootingSpecs(newSpecs);
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`topBars-${footing.id}`} className="ml-2 text-sm font-medium text-gray-700">
                        Top Bars Required
                      </label>
                    </div>

                    {footing.topBarsRequired && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Top Bar Size</label>
                          <select
                            value={footing.topBarSize || 12}
                            onChange={(e) => {
                              const newSpecs = footingSpecs.map(f =>
                                f.id === footing.id ? { ...f, topBarSize: parseInt(e.target.value) } : f
                              );
                              setFootingSpecs(newSpecs);
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          >
                            {BAR_SIZES.map(size => (
                              <option key={size} value={size}>{size}mm</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Spacing (mm)</label>
                          <input
                            type="number"
                            min="50"
                            max="500"
                            step="25"
                            value={footing.topBarSpacing || 200}
                            onChange={(e) => {
                              const newSpecs = footingSpecs.map(f =>
                                f.id === footing.id ? { ...f, topBarSpacing: parseInt(e.target.value) || 200 } : f
                              );
                              setFootingSpecs(newSpecs);
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculated Fields Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Calculated Values per Footing
                </h4>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Concrete Volume:</span>
                    <span className="text-sm font-medium">{calculateFootingConcreteVolume(footing).toFixed(3)} m³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Grade 40 Steel:</span>
                    <span className="text-sm font-medium">{calculateFootingReinforcementWeights(footing).grade40Weight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Grade 60 Steel:</span>
                    <span className="text-sm font-medium">{calculateFootingReinforcementWeights(footing).grade60Weight.toFixed(2)} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Footing Button - Above Assignments Section */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            setFootingSpecs([...footingSpecs, {
              id: `F${footingSpecs.length + 1}`,
              type: 'isolated',
              width: 1.5,
              length: 1.5,
              depth: 1.2,
              mainBarSize: 16,
              mainBarSpacing: 150,
              distributionBarSize: 12,
              distributionBarSpacing: 200,
              stirrupSize: 8,
              stirrupSpacing: 0.15,
              topBarsRequired: false
            }]);
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Footing
        </button>
      </div>

      {/* Footing Assignments Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Footing Assignments</h2>
        <p className="text-gray-600">Drag footing specifications onto grid positions to assign them. Click assigned cells to clear assignments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Footing Specs Palette */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Footing Specifications</h3>
          <p className="text-sm text-gray-600 mb-4">Drag these onto the grid to assign</p>
          <div className="space-y-2">
            {footingSpecs.map((footing) => (
              <div
                key={footing.id}
                draggable
                onDragStart={(e) => handleDragStart(e, footing.id)}
                className="p-3 rounded-lg border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 cursor-move transition-colors duration-200 text-center font-medium text-green-800"
                title={`${footing.id} (${footing.type}) - ${footing.width}×${footing.length}×${footing.depth}m`}
              >
                {footing.id}
              </div>
            ))}
            {footingSpecs.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No footing specs available
              </div>
            )}
          </div>
        </div>

        {/* Grid Visualization */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Foundation Grid</h3>
          <p className="text-sm text-gray-600 mb-4">Drop footing specs here to assign them to positions</p>
          {rows.length > 0 && cols.length > 0 ? (
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
                      const footingSpecId = assignedAreas[cellKey];
                      const footingSpec = footingSpecs.find(f => f.id === footingSpecId);

                      return (
                        <div
                          key={cellKey}
                          onClick={() => handleCellClick(cellKey)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, cellKey)}
                          className={`w-12 h-12 border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                            footingSpecId
                              ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer'
                              : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 cursor-pointer'
                          }`}
                          title={footingSpec ? `${footingSpec.id} (${footingSpec.type})` : 'Drop footing spec here'}
                        >
                          {footingSpec ? footingSpec.id : '+'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No grid system defined yet. Please set up the grid in the Grid System tab first.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footing Assignment Summary */}
      {footingAssignments.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
            <h3 className="text-lg font-semibold">Footing Assignment Summary</h3>
            <p className="text-green-100 text-sm">Quantities by footing specification</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Footing ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions (m)
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
                {footingSpecs
                  .filter(footingSpec => footingAssignments.some(assignment => assignment.footingSpecId === footingSpec.id))
                  .map((footingSpec) => {
                    const footingAssignmentsForSpec = footingAssignments.filter(assignment => assignment.footingSpecId === footingSpec.id);
                    const count = footingAssignmentsForSpec.length;
                    const unitVolume = calculateFootingConcreteVolume(footingSpec);
                    const totalVolume = unitVolume * count;
                    const unitSteelWeights = calculateFootingReinforcementWeights(footingSpec);

                    return (
                      <tr key={footingSpec.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {footingSpec.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {footingSpec.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {count} location{count !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {footingSpec.width}×{footingSpec.length}×{footingSpec.depth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {totalVolume.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(unitSteelWeights.grade40Weight * count).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(unitSteelWeights.grade60Weight * count).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                {/* Grand Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={4}>
                    GRAND TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {footingAssignments.reduce((sum, assignment) => {
                      const footingSpec = footingSpecs.find(f => f.id === assignment.footingSpecId);
                      return sum + (footingSpec ? calculateFootingConcreteVolume(footingSpec) : 0);
                    }, 0).toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {footingAssignments.reduce((sum, assignment) => {
                      const footingSpec = footingSpecs.find(f => f.id === assignment.footingSpecId);
                      const steelWeights = footingSpec ? calculateFootingReinforcementWeights(footingSpec) : { grade40Weight: 0, grade60Weight: 0, totalWeight: 0 };
                      return sum + steelWeights.grade40Weight;
                    }, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {footingAssignments.reduce((sum, assignment) => {
                      const footingSpec = footingSpecs.find(f => f.id === assignment.footingSpecId);
                      const steelWeights = footingSpec ? calculateFootingReinforcementWeights(footingSpec) : { grade40Weight: 0, grade60Weight: 0, totalWeight: 0 };
                      return sum + steelWeights.grade60Weight;
                    }, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}