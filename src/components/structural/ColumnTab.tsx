import { ColumnSpec, Floor } from './types';
import { BAR_SIZES } from './utils';
import { calculateColumnReinforcementWeights } from './utils';

interface ColumnTabProps {
  columnSpecs: ColumnSpec[];
  updateCurrentFloor: (updates: Partial<Floor>) => void;
}

export default function ColumnTab({ columnSpecs, updateCurrentFloor }: ColumnTabProps) {
  return (
    <div>
      {/* Column Specifications Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Column Specifications</h2>
        <p className="text-gray-600">Configure column dimensions and reinforcement details</p>
      </div>

      {/* Column Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-8">
        {columnSpecs.map((column) => (
          <div key={column.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={column.id}
                    onChange={(e) => {
                      updateCurrentFloor({
                        columnSpecs: columnSpecs.map(c => 
                          c.id === column.id ? { ...c, id: e.target.value } : c
                        )
                      });
                    }}
                    className="bg-transparent text-white text-xl font-bold border-none outline-none placeholder-green-200 w-full"
                    placeholder="Column ID"
                  />
                </div>
                <button
                  onClick={() => {
                    updateCurrentFloor({
                      columnSpecs: columnSpecs.filter(c => c.id !== column.id)
                    });
                  }}
                  className="ml-2 text-green-200 hover:text-white transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Dimensions */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Dimensions
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={column.width}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, width: parseFloat(e.target.value) || 0 } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Depth (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={column.depth}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, depth: parseFloat(e.target.value) || 0 } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={column.height}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, height: parseFloat(e.target.value) || 0 } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Main Reinforcement */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Main Reinforcement
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Size (mm)</label>
                    <select
                      value={column.mainBarSize}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, mainBarSize: parseInt(e.target.value) } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={column.mainBarQty}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, mainBarQty: parseInt(e.target.value) || 0 } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ties/Hoops */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Ties/Hoops
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tie Size (mm)</label>
                    <select
                      value={column.tieSize}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, tieSize: parseInt(e.target.value) } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={column.tieSpacing}
                      onChange={(e) => {
                        updateCurrentFloor({
                          columnSpecs: columnSpecs.map(c => 
                            c.id === column.id ? { ...c, tieSpacing: parseFloat(e.target.value) || 0 } : c
                          )
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Values */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Calculated Values</h4>
                {(() => {
                  const weights = calculateColumnReinforcementWeights(column);
                  const concreteVolume = column.width * column.depth * column.height;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Concrete Volume:</span>
                        <span className="font-medium">{concreteVolume.toFixed(3)} m³</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Grade 40 Steel:</span>
                        <span className="font-medium text-orange-600">{weights.grade40Weight.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Grade 60 Steel:</span>
                        <span className="font-medium text-red-600">{weights.grade60Weight.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold text-gray-700">Total Steel:</span>
                        <span className="font-bold">{weights.totalWeight.toFixed(1)} kg</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Column Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            updateCurrentFloor({
              columnSpecs: [...columnSpecs, { 
                id: `C${columnSpecs.length + 1}`, 
                width: 0.4, 
                depth: 0.4, 
                height: 3.0,
                mainBarSize: 16, 
                mainBarQty: 8, 
                tieSize: 10, 
                tieSpacing: 0.15 
              }]
            });
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Column Specification
        </button>
      </div>
    </div>
  );
}