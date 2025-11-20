import {
  calculateReinforcementWeights,
  calculateColumnReinforcementWeights,
  calculateBuildingSummary,
  BAR_SIZES,
  BAR_WEIGHTS,
  calculateGridArea,
  calculateTotalSlabArea,
  validateGridSystem
} from '../../../src/components/structural/utils'
import { BeamSpec, ColumnSpec, Building } from '../../../src/components/structural/types'

describe('Structural Utils', () => {
  describe('BAR_SIZES and BAR_WEIGHTS', () => {
    it('should have correct bar sizes', () => {
      expect(BAR_SIZES).toEqual([8, 10, 12, 16, 20, 25, 32])
    })

    it('should have correct bar weights', () => {
      expect(BAR_WEIGHTS[8]).toBe(0.395)
      expect(BAR_WEIGHTS[12]).toBe(0.888)
      expect(BAR_WEIGHTS[16]).toBe(1.578)
      expect(BAR_WEIGHTS[20]).toBe(2.466)
      expect(BAR_WEIGHTS[32]).toBe(6.313)
    })
  })

  describe('calculateReinforcementWeights', () => {
    const mockBeam: BeamSpec = {
      id: 'B1',
      width: 0.3,
      depth: 0.5,
      topBarSize: 12,
      topBarQty: 2,
      webBarSize: 8,
      webBarQty: 2,
      bottomBarSize: 16,
      bottomBarQty: 2,
      stirrupSize: 8,
      stirrupQty: 6
    }

    it('should calculate weights for all reinforcement types', () => {
      const result = calculateReinforcementWeights(mockBeam)

      expect(result.grade40Weight).toBeGreaterThan(0)
      expect(result.grade60Weight).toBeGreaterThan(0)
      expect(result.totalWeight).toBe(result.grade40Weight + result.grade60Weight)
    })

    it('should classify bars correctly by grade', () => {
      // 12mm and 8mm should be grade 40, 16mm should be grade 60
      const result = calculateReinforcementWeights(mockBeam)

      // Grade 40: 12mm top (2 bars) + 8mm web (2 bars) + 8mm stirrups
      const expectedGrade40 = (BAR_WEIGHTS[12] * 2) + (BAR_WEIGHTS[8] * 2) +
                             (BAR_WEIGHTS[8] * 2 * (0.3 + 0.5) * 6)

      // Grade 60: 16mm bottom (2 bars)
      const expectedGrade60 = BAR_WEIGHTS[16] * 2

      expect(result.grade40Weight).toBeCloseTo(expectedGrade40, 3)
      expect(result.grade60Weight).toBeCloseTo(expectedGrade60, 3)
    })

    it('should handle beams with no reinforcement', () => {
      const emptyBeam: BeamSpec = {
        id: 'B1',
        width: 0.3,
        depth: 0.5,
        topBarSize: 12,
        topBarQty: 0,
        webBarSize: 8,
        webBarQty: 0,
        bottomBarSize: 16,
        bottomBarQty: 0,
        stirrupSize: 8,
        stirrupQty: 0
      }

      const result = calculateReinforcementWeights(emptyBeam)

      expect(result.grade40Weight).toBe(0)
      expect(result.grade60Weight).toBe(0)
      expect(result.totalWeight).toBe(0)
    })
  })

  describe('calculateColumnReinforcementWeights', () => {
    const mockColumn: ColumnSpec = {
      id: 'C1',
      width: 0.4,
      depth: 0.4,
      height: 3.0,
      mainBarSize: 16,
      mainBarQty: 8,
      tieSize: 10,
      tieSpacing: 0.15
    }

    it('should calculate column reinforcement weights', () => {
      const result = calculateColumnReinforcementWeights(mockColumn)

      expect(result.grade40Weight).toBeGreaterThan(0)
      expect(result.grade60Weight).toBeGreaterThan(0)
      expect(result.totalWeight).toBe(result.grade40Weight + result.grade60Weight)
    })

    it('should calculate main bars weight correctly', () => {
      const result = calculateColumnReinforcementWeights(mockColumn)

      // Main bars: 16mm × 8 bars × 3m height = grade 60
      const expectedMainBars = BAR_WEIGHTS[16] * 8 * 3.0

      expect(result.grade60Weight).toBeCloseTo(expectedMainBars, 3)
    })

    it('should calculate ties weight correctly', () => {
      const result = calculateColumnReinforcementWeights(mockColumn)

      // Ties: perimeter × number of ties × tie weight
      const perimeter = 2 * (0.4 + 0.4) // 1.6m
      const numTies = Math.ceil(3.0 / 0.15) // 20 ties
      const expectedTies = BAR_WEIGHTS[10] * perimeter * numTies

      expect(result.grade40Weight).toBeCloseTo(expectedTies, 3)
    })
  })

  describe('calculateBuildingSummary', () => {
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
              { label: 'A', position: 0 },
              { label: 'B', position: 5 },
              { label: 'C', position: 10 }
            ],
            rows: [
              { label: '1', position: 0 },
              { label: '2', position: 4 },
              { label: '3', position: 8 }
            ]
          },
          beamSpecs: [
            {
              id: 'B1',
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
            }
          ],
          columnSpecs: [
            {
              id: 'C1',
              width: 0.4,
              depth: 0.4,
              height: 3.0,
              mainBarSize: 16,
              mainBarQty: 8,
              tieSize: 10,
              tieSpacing: 0.15
            }
          ],
          colBeamIds: ['B1', 'B1', 'B1', 'B1', 'B1', 'B1'], // 3 rows × 2 spans = 6
          rowBeamIds: ['B1', 'B1', 'B1', 'B1', 'B1', 'B1'], // 3 cols × 2 spans = 6
          columnIds: ['C1', '', 'C1', 'C1', '', 'C1', 'C1', '', 'C1'], // 3×3 grid
          inheritsStructural: false
        }
      ]
    }

    it('should calculate building summary correctly', () => {
      const result = calculateBuildingSummary(mockBuilding)

      expect(result.totalConcreteVolume).toBeGreaterThan(0)
      expect(result.totalGrade40Steel).toBeGreaterThan(0)
      expect(result.totalGrade60Steel).toBeGreaterThan(0)
      expect(result.floorBreakdown).toHaveLength(1)
    })

    it('should include floor breakdown', () => {
      const result = calculateBuildingSummary(mockBuilding)

      const floor = result.floorBreakdown[0]
      expect(floor.floorId).toBe('floor-1')
      expect(floor.floorName).toBe('Ground Floor')
      expect(floor.concreteVolume).toBeGreaterThan(0)
      expect(floor.beamBreakdown).toBeDefined()
      expect(floor.columnBreakdown).toBeDefined()
    })

    it('should calculate beam quantities correctly', () => {
      const result = calculateBuildingSummary(mockBuilding)

      const floor = result.floorBreakdown[0]
      expect(floor.beamBreakdown).toHaveLength(1) // Only B1 beams

      const beamData = floor.beamBreakdown[0]
      expect(beamData.beamId).toBe('B1')
      expect(beamData.totalLength).toBeGreaterThan(0)
      expect(beamData.concreteVolume).toBeGreaterThan(0)
    })

    it('should calculate column quantities correctly', () => {
      const result = calculateBuildingSummary(mockBuilding)

      const floor = result.floorBreakdown[0]
      expect(floor.columnBreakdown).toHaveLength(1) // Only C1 columns

      const columnData = floor.columnBreakdown[0]
      expect(columnData.columnId).toBe('C1')
      expect(columnData.count).toBe(6) // 6 C1 columns in the grid
      expect(columnData.locations).toEqual(['1A', '1C', '2A', '2C', '3A', '3C'])
    })

    it('should handle empty building', () => {
      const emptyBuilding: Building = {
        id: 'empty',
        name: 'Empty',
        floors: []
      }

      const result = calculateBuildingSummary(emptyBuilding)

      expect(result.totalConcreteVolume).toBe(0)
      expect(result.totalGrade40Steel).toBe(0)
      expect(result.totalGrade60Steel).toBe(0)
      expect(result.floorBreakdown).toHaveLength(0)
    })
  })

  describe('Grid Area Calculations', () => {
    const mockRows = [
      { label: 'A', position: 0 },
      { label: 'B', position: 4 },
      { label: 'C', position: 8 }
    ]

    const mockCols = [
      { label: '1', position: 0 },
      { label: '2', position: 5 },
      { label: '3', position: 10 },
      { label: '4', position: 15 }
    ]

    describe('calculateGridArea', () => {
      it('should calculate single cell area correctly', () => {
        const result = calculateGridArea('A', 'A', '1', '1', mockRows, mockCols)
        expect(result.isValid).toBe(true)
        expect(result.area).toBe(20) // 4m × 5m
        expect(result.width).toBe(4)
        expect(result.length).toBe(5)
      })

      it('should calculate rectangular span area correctly', () => {
        const result = calculateGridArea('A', 'B', '1', '2', mockRows, mockCols)
        expect(result.isValid).toBe(true)
        expect(result.area).toBe(20) // 4m × 5m
        expect(result.width).toBe(4)
        expect(result.length).toBe(5)
      })

      it('should calculate large span area correctly', () => {
        const result = calculateGridArea('A', 'C', '1', '4', mockRows, mockCols)
        expect(result.isValid).toBe(true)
        expect(result.area).toBe(120) // 8m × 15m = 120m²
        expect(result.width).toBe(8)
        expect(result.length).toBe(15)
      })

      it('should handle edge cell calculations', () => {
        // Last row, last column cell
        const result = calculateGridArea('C', 'C', '4', '4', mockRows, mockCols)
        expect(result.isValid).toBe(true)
        expect(result.area).toBe(20) // Uses spacing from previous: 4m × 5m
      })

      it('should return error for invalid grid lines', () => {
        const result = calculateGridArea('X', 'A', '1', '1', mockRows, mockCols)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('start row "X"')
      })

      it('should return error for invalid span ordering', () => {
        const result = calculateGridArea('B', 'A', '1', '2', mockRows, mockCols)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('start position must be before end position')
      })

      it('should return error for empty grids', () => {
        const result = calculateGridArea('A', 'A', '1', '1', [], mockCols)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('rows or columns are empty')
      })
    })

    describe('calculateTotalSlabArea', () => {
      const mockAssignments = [
        { slabSpecId: 'S1', area: 20 },
        { slabSpecId: 'S1', area: 30 },
        { slabSpecId: 'S2', area: 15 },
        { slabSpecId: 'S1', area: 10 }
      ]

      it('should calculate total area for specific slab spec', () => {
        const total = calculateTotalSlabArea(mockAssignments, 'S1')
        expect(total).toBe(60) // 20 + 30 + 10
      })

      it('should return 0 for slab spec with no assignments', () => {
        const total = calculateTotalSlabArea(mockAssignments, 'S3')
        expect(total).toBe(0)
      })

      it('should handle empty assignments array', () => {
        const total = calculateTotalSlabArea([], 'S1')
        expect(total).toBe(0)
      })
    })

    describe('validateGridSystem', () => {
      it('should validate correct grid system', () => {
        const result = validateGridSystem(mockRows, mockCols)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should detect duplicate labels', () => {
        const badRows = [
          { label: 'A', position: 0 },
          { label: 'A', position: 4 }, // Duplicate
          { label: 'C', position: 8 }
        ]
        const result = validateGridSystem(badRows, mockCols)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Duplicate row labels: A')
      })

      it('should detect unsorted positions', () => {
        const badRows = [
          { label: 'A', position: 0 },
          { label: 'C', position: 8 },
          { label: 'B', position: 4 } // Out of order
        ]
        const result = validateGridSystem(badRows, mockCols)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Row positions are not in ascending order')
      })

      it('should handle empty grids', () => {
        const result = validateGridSystem([], [])
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('No rows defined in grid system')
        expect(result.errors).toContain('No columns defined in grid system')
      })
    })
  })
})