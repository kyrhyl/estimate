import { calculateFootingReinforcementWeights, calculateFootingConcreteVolume } from '../../../src/components/structural/utils'
import { FootingSpec } from '../../../src/components/structural/types'

describe('Footing Calculations', () => {
  describe('calculateFootingConcreteVolume', () => {
    it('calculates concrete volume correctly', () => {
      const footing: FootingSpec = {
        id: 'F1',
        type: 'isolated',
        width: 2.0,    // meters
        length: 2.0,   // meters
        depth: 1.5,    // meters
        mainBarSize: 16,
        mainBarSpacing: 150,
        distributionBarSize: 12,
        distributionBarSpacing: 200,
        stirrupSize: 10,
        stirrupSpacing: 0.15,
        topBarsRequired: false
      }

      const volume = calculateFootingConcreteVolume(footing)
      expect(volume).toBe(6.0) // 2.0 * 2.0 * 1.5 = 6.0 m³
    })

    it('handles different dimensions', () => {
      const footing: FootingSpec = {
        id: 'F2',
        type: 'strip',
        width: 0.6,    // meters
        length: 5.0,   // meters
        depth: 1.2,    // meters
        mainBarSize: 16,
        mainBarSpacing: 150,
        distributionBarSize: 12,
        distributionBarSpacing: 200,
        stirrupSize: 10,
        stirrupSpacing: 0.15,
        topBarsRequired: false
      }

      const volume = calculateFootingConcreteVolume(footing)
      expect(volume).toBeCloseTo(3.6, 5) // 0.6 * 5.0 * 1.2 = 3.6 m³
    })
  })

  describe('calculateFootingReinforcementWeights', () => {
    const baseFooting: FootingSpec = {
      id: 'F1',
      type: 'isolated',
      width: 2.0,    // meters
      length: 3.0,   // meters
      depth: 1.5,    // meters
      mainBarSize: 16,
      mainBarSpacing: 150, // mm
      distributionBarSize: 12,
      distributionBarSpacing: 200, // mm
      stirrupSize: 10,
      stirrupSpacing: 0.15, // meters
      topBarsRequired: false
    }

    it('calculates total reinforcement weights correctly', () => {
      const weights = calculateFootingReinforcementWeights(baseFooting)

      // Expected calculations:
      // Main bars (16mm, Grade 60): spacing 150mm = 0.15m
      // X direction: ceil(3.0/0.15) = 20 bars × 2.0m = 40m
      // Y direction: ceil(2.0/0.15) = 14 bars × 3.0m = 42m
      // Total main: 82m × 1.578 kg/m = 129.4 kg

      // Distribution bars (12mm, Grade 40): spacing 200mm = 0.2m
      // X direction: ceil(3.0/0.2) = 15 bars × 2.0m = 30m
      // Y direction: ceil(2.0/0.2) = 10 bars × 3.0m = 30m
      // Total dist: 60m × 0.888 kg/m = 53.28 kg

      // Stirrups (10mm, Grade 40): perimeter = 2×(2+3)=10m
      // Number: ceil(1.5/0.15) = 10 stirrups × 10m = 100m
      // Weight: 100m × 0.617 kg/m = 61.7 kg

      // Total Grade 60: 129.4 kg (main bars)
      // Total Grade 40: 53.28 + 61.7 = 114.98 kg (dist + stirrups)

      expect(weights.grade60Weight).toBeCloseTo(129.4, 1)
      expect(weights.grade40Weight).toBeCloseTo(114.98, 1)
      expect(weights.totalWeight).toBeCloseTo(244.38, 1)
    })

    it('includes top bars when required', () => {
      const footingWithTopBars = {
        ...baseFooting,
        topBarsRequired: true,
        topBarSize: 12,
        topBarSpacing: 200
      }

      const weights = calculateFootingReinforcementWeights(footingWithTopBars)

      // Top bars same as distribution bars: 60m * 0.888 kg/m = 53.28 kg
      const expectedTopBarWeight = 53.28
      expect(weights.grade40Weight).toBeCloseTo(53.28 + 61.7 + expectedTopBarWeight, 1)
    })

    it('classifies bars correctly by size', () => {
      const mixedSizeFooting: FootingSpec = {
        ...baseFooting,
        mainBarSize: 12, // Grade 40 (< 16mm)
        distributionBarSize: 20, // Grade 60 (≥ 16mm)
        stirrupSize: 8 // Grade 40 (< 16mm)
      }

      const weights = calculateFootingReinforcementWeights(mixedSizeFooting)

      // Main bars (12mm): Grade 40
      // Distribution bars (20mm): Grade 60
      // Stirrups (8mm): Grade 40

      expect(weights.grade40Weight).toBeGreaterThan(0)
      expect(weights.grade60Weight).toBeGreaterThan(0)
      expect(weights.totalWeight).toBe(weights.grade40Weight + weights.grade60Weight)
    })

    it('handles edge cases', () => {
      const minimalFooting: FootingSpec = {
        id: 'F-min',
        type: 'isolated',
        width: 1.0,
        length: 1.0,
        depth: 1.0,
        mainBarSize: 12,
        mainBarSpacing: 1000, // 1 bar in each direction
        distributionBarSize: 12,
        distributionBarSpacing: 1000,
        stirrupSize: 10,
        stirrupSpacing: 1.0, // 1 stirrup
        topBarsRequired: false
      }

      const weights = calculateFootingReinforcementWeights(minimalFooting)

      // Should not crash and return reasonable values
      expect(weights.grade40Weight).toBeGreaterThanOrEqual(0)
      expect(weights.grade60Weight).toBeGreaterThanOrEqual(0)
      expect(weights.totalWeight).toBe(weights.grade40Weight + weights.grade60Weight)
    })
  })
})