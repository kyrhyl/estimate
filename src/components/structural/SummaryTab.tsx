import { Building } from './types';
import { calculateBuildingSummary } from './utils';

interface SummaryTabProps {
  building: Building;
}

export default function SummaryTab({ building }: SummaryTabProps) {
  const summary = calculateBuildingSummary(building);

  return (
    <div>
      {/* Building Summary Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Building Summary</h2>
        <p className="text-gray-600">Comprehensive material overview for {building.name}</p>
      </div>

      <div className="space-y-8">
        {/* Building Totals Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Building Totals</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {summary.totalConcreteVolume.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Concrete Volume (m³)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {summary.totalGrade40Steel.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Grade 40 Steel (kg)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {summary.totalGrade60Steel.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Grade 60 Steel (kg)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floor-by-Floor Breakdown */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Floor Breakdown</h3>
          {summary.floorBreakdown.map((floor) => (
            <div key={floor.floorId} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Floor Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900">{floor.floorName}</h4>
                  <div className="flex space-x-6 text-sm">
                    <span className="text-gray-600">
                      <strong>Concrete:</strong> {floor.concreteVolume.toFixed(2)} m³
                    </span>
                    <span className="text-orange-600">
                      <strong>Grade 40:</strong> {floor.grade40Steel.toFixed(1)} kg
                    </span>
                    <span className="text-red-600">
                      <strong>Grade 60:</strong> {floor.grade60Steel.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Beam Details */}
              <div className="p-6">
                {floor.beamBreakdown.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">Beams</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-medium text-gray-900">Beam ID</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Segments</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Total Length (m)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Concrete (m³)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 40 (kg)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 60 (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floor.beamBreakdown.map((beam) => (
                            <tr key={beam.beamId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium text-blue-600">{beam.beamId}</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">
                                {beam.segments.join(', ')}
                              </td>
                              <td className="py-3 px-2 text-center font-mono">{beam.totalLength.toFixed(1)}</td>
                              <td className="py-3 px-2 text-center font-mono">{beam.concreteVolume.toFixed(2)}</td>
                              <td className="py-3 px-2 text-center font-mono text-orange-600">
                                {beam.grade40Steel.toFixed(1)}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-red-600">
                                {beam.grade60Steel.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Column Details */}
                {floor.columnBreakdown.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">Columns</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-medium text-gray-900">Column ID</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Locations</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Count</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Concrete (m³)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 40 (kg)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 60 (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floor.columnBreakdown.map((column) => (
                            <tr key={column.columnId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium text-green-600">{column.columnId}</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">
                                {column.locations.join(', ')}
                              </td>
                              <td className="py-3 px-2 text-center font-mono">{column.count}</td>
                              <td className="py-3 px-2 text-center font-mono">{column.concreteVolume.toFixed(2)}</td>
                              <td className="py-3 px-2 text-center font-mono text-orange-600">
                                {column.grade40Steel.toFixed(1)}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-red-600">
                                {column.grade60Steel.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Slab Details */}
                {floor.slabBreakdown.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">Slabs</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-medium text-gray-900">Slab ID</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Areas</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Total Area (m²)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Concrete (m³)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 40 (kg)</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-900">Grade 60 (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floor.slabBreakdown.map((slab) => (
                            <tr key={slab.slabId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium text-purple-600">{slab.slabId}</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">
                                {slab.areas.join(', ')}
                              </td>
                              <td className="py-3 px-2 text-center font-mono">{slab.totalArea.toFixed(1)}</td>
                              <td className="py-3 px-2 text-center font-mono">{slab.concreteVolume.toFixed(2)}</td>
                              <td className="py-3 px-2 text-center font-mono text-orange-600">
                                {slab.grade40Steel.toFixed(1)}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-red-600">
                                {slab.grade60Steel.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}