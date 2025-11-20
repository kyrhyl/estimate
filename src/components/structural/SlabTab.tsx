import { SlabSpec } from './types';
import { BAR_SIZES } from './utils';
import { calculateSlabReinforcementWeights, calculateSlabConcreteVolume, getSlabDesignRecommendations } from './utils';

interface SlabTabProps {
  slabSpecs: SlabSpec[];
  setSlabSpecs: (specs: SlabSpec[]) => void;
}

export default function SlabTab({ slabSpecs, setSlabSpecs }: SlabTabProps) {
  return (
    <div>
      {/* Slab Specifications Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Slab Specifications</h2>
        <p className="text-gray-600">Configure slab thickness and reinforcement details including distribution and temperature bars</p>
      </div>

      {/* Slab Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 mb-8">
        {slabSpecs.map((slab) => (
          <div key={slab.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={slab.id}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const isDuplicate = slabSpecs.some(s => s.id === newValue && s !== slab);
                      if (!isDuplicate) {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, id: newValue } : s
                        );
                        setSlabSpecs(newSpecs);
                      }
                    }}
                    className="text-xl font-semibold bg-transparent border-b border-green-300 border-opacity-50 text-white placeholder-green-200 focus:outline-none focus:border-white w-full"
                    placeholder="Slab Name"
                  />
                  <p className="text-green-100 text-sm mt-1">{slab.type === 'two-way' ? 'Two-Way Slab' : 'One-Way Slab'}</p>
                </div>
                <button
                  onClick={() => {
                    const newSpecs = slabSpecs.filter(s => s.id !== slab.id);
                    setSlabSpecs(newSpecs);
                  }}
                  className="ml-4 p-2 hover:bg-red-600 rounded-md transition-colors duration-200 group"
                  title="Delete Slab"
                >
                  <svg className="w-4 h-4 text-red-200 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Basic Properties Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Basic Properties
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (mm)</label>
                    <input
                      type="number"
                      step="10"
                      min="50"
                      max="500"
                      value={slab.thickness}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, thickness: parseInt(e.target.value) || 100 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slab Type</label>
                    <select
                      value={slab.type}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, type: e.target.value as 'one-way' | 'two-way' } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="one-way">One-Way</option>
                      <option value="two-way">Two-Way</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Main Reinforcement Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Main Reinforcement (Bottom Layer)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Size (mm)</label>
                    <select
                      value={slab.mainBarSize}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, mainBarSize: parseInt(e.target.value) || 12 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (mm)</label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="500"
                      value={slab.mainBarSpacing}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, mainBarSpacing: parseInt(e.target.value) || 150 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Distribution Bars Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Distribution Bars (Perpendicular)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Size (mm)</label>
                    <select
                      value={slab.distributionBarSize}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, distributionBarSize: parseInt(e.target.value) || 8 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (mm)</label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="500"
                      value={slab.distributionBarSpacing}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, distributionBarSpacing: parseInt(e.target.value) || 250 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Reinforcement Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Temperature Reinforcement
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Size (mm)</label>
                    <select
                      value={slab.temperatureBarSize}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, temperatureBarSize: parseInt(e.target.value) || 8 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (mm)</label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="500"
                      value={slab.temperatureBarSpacing}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, temperatureBarSpacing: parseInt(e.target.value) || 150 } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Top Reinforcement Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Additional Top Reinforcement (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bar Size (mm)</label>
                    <select
                      value={slab.topBarSize || ''}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, topBarSize: e.target.value ? parseInt(e.target.value) : null } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {BAR_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (mm)</label>
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="500"
                      value={slab.topBarSpacing || ''}
                      onChange={(e) => {
                        const newSpecs = slabSpecs.map(s =>
                          s.id === slab.id ? { ...s, topBarSpacing: e.target.value ? parseInt(e.target.value) : null } : s
                        );
                        setSlabSpecs(newSpecs);
                      }}
                      disabled={!slab.topBarSize}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Calculations Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Material Quantities</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Volume:</span>
                    <span className="font-medium">{(slab.thickness / 1000).toFixed(3)} m³/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade 40 Steel:</span>
                    <span className="font-medium">{calculateSlabReinforcementWeights(slab).grade40Weight.toFixed(2)} kg/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade 60 Steel:</span>
                    <span className="font-medium">{calculateSlabReinforcementWeights(slab).grade60Weight.toFixed(2)} kg/m²</span>
                  </div>
                </div>

                {/* Design Recommendations */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Design Recommendations</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    {(getSlabDesignRecommendations(slab)?.designNotes || []).map((rec, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slab Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setSlabSpecs([...slabSpecs, {
              id: `S${slabSpecs.length + 1}`,
              thickness: 125,
              type: 'two-way',
              mainBarSize: 12,
              mainBarSpacing: 150,
              distributionBarSize: 8,
              distributionBarSpacing: 250,
              temperatureBarSize: 8,
              temperatureBarSpacing: 150,
              topBarSize: null,
              topBarSpacing: null
            }]);
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Slab
        </button>
      </div>
    </div>
  );
}