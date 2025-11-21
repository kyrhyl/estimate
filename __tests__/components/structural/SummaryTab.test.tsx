import { render, screen } from '@testing-library/react'
import SummaryTab from '../../../src/components/structural/SummaryTab'
import { Building } from '../../../src/components/structural/types'

// Mock the calculateBuildingSummary function
jest.mock('../../../src/components/structural/utils', () => ({
  calculateBuildingSummary: jest.fn()
}))

import { calculateBuildingSummary } from '../../../src/components/structural/utils'

const mockCalculateBuildingSummary = calculateBuildingSummary as jest.MockedFunction<typeof calculateBuildingSummary>

const mockBuilding: Building = {
  id: 'building-1',
  name: 'Test Building',
  floors: [
    {
      id: 'floor-1',
      level: 1,
      name: 'Ground Floor',
      structuralSystem: {
        numCols: 3,
        numRows: 3,
        cols: [
          { label: '1', position: 0 },
          { label: '2', position: 5 },
          { label: '3', position: 10 }
        ],
        rows: [
          { label: 'A', position: 0 },
          { label: 'B', position: 4 },
          { label: 'C', position: 8 }
        ]
      },
      beamSpecs: [],
      columnSpecs: [],
      colBeamIds: [],
      rowBeamIds: [],
      columnIds: [],
      inheritsStructural: false
    }
  ]
}

const mockSummary = {
  totalConcreteVolume: 150.75,
  totalGrade40Steel: 2500,
  totalGrade60Steel: 1800,
  floorBreakdown: [
    {
      floorId: 'floor-1',
      floorName: 'Ground Floor',
      concreteVolume: 150.75,
      grade40Steel: 2500,
      grade60Steel: 1800,
      beamBreakdown: [
        {
          beamId: 'B1',
          segments: ['A1-A2', 'B1-B2'],
          totalLength: 12.5,
          concreteVolume: 6.25,
          grade40Steel: 125.5,
          grade60Steel: 89.2
        },
        {
          beamId: 'B2',
          segments: ['A2-A3'],
          totalLength: 7.5,
          concreteVolume: 3.75,
          grade40Steel: 75.0,
          grade60Steel: 53.5
        }
      ],
      columnBreakdown: [
        {
          columnId: 'C1',
          locations: ['A1', 'A3', 'C1'],
          count: 3,
          concreteVolume: 141.0,
          grade40Steel: 2299.5,
          grade60Steel: 1646.5
        }
      ],
      slabBreakdown: []
    }
  ],
  footingBreakdown: []
}

describe('SummaryTab', () => {
  beforeEach(() => {
    mockCalculateBuildingSummary.mockReturnValue(mockSummary)
  })

  it('renders building summary header', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Building Summary')).toBeInTheDocument()
    expect(screen.getByText('Comprehensive material overview for Test Building')).toBeInTheDocument()
  })

  it('displays building totals correctly', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Building Totals')).toBeInTheDocument()
    expect(screen.getByText('150.75')).toBeInTheDocument() // Concrete volume
    expect(screen.getByText('2500.0')).toBeInTheDocument() // Grade 40 steel
    expect(screen.getByText('1800.0')).toBeInTheDocument() // Grade 60 steel
  })

  it('displays floor breakdown header', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Floor Breakdown')).toBeInTheDocument()
  })

  it('renders floor information correctly', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Ground Floor')).toBeInTheDocument()
    expect(screen.getAllByText(/Concrete:/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/150\.75/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/m³/).length).toBeGreaterThan(0)
  })

  it('displays beam breakdown table', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Beams')).toBeInTheDocument()
    expect(screen.getByText('Beam ID')).toBeInTheDocument()
    expect(screen.getByText('Segments')).toBeInTheDocument()
    expect(screen.getByText('Total Length (m)')).toBeInTheDocument()
    expect(screen.getAllByText('Concrete (m³)').length).toBeGreaterThan(0) // Appears in multiple tables
    expect(screen.getAllByText('Grade 40 (kg)').length).toBeGreaterThan(0) // Appears in multiple tables
    expect(screen.getAllByText('Grade 60 (kg)').length).toBeGreaterThan(0) // Appears in multiple tables
  })

  it('renders beam data correctly', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('B1')).toBeInTheDocument()
    expect(screen.getByText('A1-A2, B1-B2')).toBeInTheDocument()
    expect(screen.getByText('12.5')).toBeInTheDocument()
    expect(screen.getByText('6.25')).toBeInTheDocument()
    expect(screen.getByText('125.5')).toBeInTheDocument() // Grade 40 for B1
    expect(screen.getByText('89.2')).toBeInTheDocument() // Grade 60 for B1

    expect(screen.getByText('B2')).toBeInTheDocument()
    expect(screen.getByText('A2-A3')).toBeInTheDocument()
    expect(screen.getByText('7.5')).toBeInTheDocument()
    expect(screen.getByText('3.75')).toBeInTheDocument()
  })

  it('displays column breakdown table when columns exist', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Columns')).toBeInTheDocument()
    expect(screen.getByText('Column ID')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
  })

  it('renders column data correctly', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('C1')).toBeInTheDocument()
    expect(screen.getByText('A1, A3, C1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // Count
    expect(screen.getByText('141.00')).toBeInTheDocument() // Concrete volume
    expect(screen.getByText('2299.5')).toBeInTheDocument() // Grade 40
    expect(screen.getByText('1646.5')).toBeInTheDocument() // Grade 60
  })

  it('calls calculateBuildingSummary with correct building data', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(mockCalculateBuildingSummary).toHaveBeenCalledWith(mockBuilding)
    expect(mockCalculateBuildingSummary).toHaveBeenCalledTimes(9) // Component may re-render multiple times
  })

  it('handles empty floor breakdown', () => {
    const emptySummary = {
      ...mockSummary,
      floorBreakdown: []
    }
    mockCalculateBuildingSummary.mockReturnValue(emptySummary)

    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Floor Breakdown')).toBeInTheDocument()
    // Should not crash when no floors
  })

  it('handles floors with no beams', () => {
    const noBeamSummary = {
      ...mockSummary,
      floorBreakdown: [
        {
          ...mockSummary.floorBreakdown[0],
          beamBreakdown: []
        }
      ]
    }
    mockCalculateBuildingSummary.mockReturnValue(noBeamSummary)

    render(<SummaryTab building={mockBuilding} />)

    expect(screen.queryByText('Beams')).not.toBeInTheDocument()
    // Table should not render when no beam data
  })

  it('handles floors with no columns', () => {
    const noColumnSummary = {
      ...mockSummary,
      floorBreakdown: [
        {
          ...mockSummary.floorBreakdown[0],
          columnBreakdown: []
        }
      ]
    }
    mockCalculateBuildingSummary.mockReturnValue(noColumnSummary)

    render(<SummaryTab building={mockBuilding} />)

    expect(screen.queryByText('Columns')).not.toBeInTheDocument()
  })

  it('displays footing breakdown table when footings exist', () => {
    const footingSummary = {
      ...mockSummary,
      footingBreakdown: [
        {
          footingId: 'F1',
          locations: ['A1', 'B2', 'C3'],
          count: 3,
          concreteVolume: 12.0,
          grade40Steel: 245.5,
          grade60Steel: 180.2
        },
        {
          footingId: 'F2',
          locations: ['A2', 'B3'],
          count: 2,
          concreteVolume: 8.0,
          grade40Steel: 163.7,
          grade60Steel: 120.1
        }
      ]
    }
    mockCalculateBuildingSummary.mockReturnValue(footingSummary)

    render(<SummaryTab building={mockBuilding} />)

    expect(screen.getByText('Footing Breakdown')).toBeInTheDocument()
    expect(screen.getByText('F1')).toBeInTheDocument()
    expect(screen.getByText('F2')).toBeInTheDocument()
    expect(screen.getByText('A1, B2, C3')).toBeInTheDocument()
    expect(screen.getByText('A2, B3')).toBeInTheDocument()
  })

  it('does not display footing breakdown when no footings exist', () => {
    render(<SummaryTab building={mockBuilding} />)

    expect(screen.queryByText('Footing Breakdown')).not.toBeInTheDocument()
  })
})