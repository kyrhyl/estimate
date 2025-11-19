import { BeamSpec } from './types';
import { BAR_SIZES } from './utils';
import { calculateReinforcementWeights } from './utils';

interface BeamTabProps {
  beamSpecs: BeamSpec[];
  setBeamSpecs: (specs: BeamSpec[]) => void;
}

export default function BeamTab({ beamSpecs, setBeamSpecs }: BeamTabProps) {
  return (
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
  );
}