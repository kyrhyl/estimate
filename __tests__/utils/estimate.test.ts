import { calculateEstimate, saveEstimate } from '../../src/utils/estimate'

// Mock fetch globally
global.fetch = jest.fn()

describe('Estimate Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateEstimate', () => {
    it('should calculate estimate with valid parameters', () => {
      const result = calculateEstimate('100', 'concrete', 'volume')

      expect(result).toContain('Group: concrete')
      expect(result).toContain('Breakdown: volume')
      expect(result).toContain('Parameter: 100')
      expect(result).toContain('Estimated Quantity: 110')
    })

    it('should handle empty parameter', () => {
      const result = calculateEstimate('', 'concrete', 'volume')

      expect(result).toContain('Parameter: ')
      expect(result).toContain('Estimated Quantity: -')
    })

    it('should handle zero parameter', () => {
      const result = calculateEstimate('0', 'concrete', 'volume')

      expect(result).toContain('Estimated Quantity: 0')
    })

    it('should apply 10% markup to numeric values', () => {
      const result = calculateEstimate('50', 'steel', 'weight')

      expect(result).toContain('Estimated Quantity: 55')
    })
  })

  describe('saveEstimate', () => {
    const mockEstimateData = {
      group: 'concrete',
      breakdown: 'volume',
      parameter: '100',
      estimatedQuantity: 110
    }

    it('should save estimate successfully', async () => {
      const mockResponse = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await saveEstimate(mockEstimateData)

      expect(global.fetch).toHaveBeenCalledWith('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"group":"concrete"')
      })
      expect(result).toBe('Saved successfully!')
    })

    it('should handle save failure', async () => {
      const mockResponse = { success: false }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await saveEstimate(mockEstimateData)

      expect(result).toBe('Save failed.')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await saveEstimate(mockEstimateData)

      expect(result).toBe('Error saving estimate.')
    })

    it('should send correct data structure', async () => {
      const mockResponse = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      await saveEstimate(mockEstimateData)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody).toEqual({
        group: 'concrete',
        breakdown: 'volume',
        parameter: '100',
        estimatedQuantity: 110,
        date: expect.any(String)
      })
      expect(requestBody.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // ISO date format
    })
  })
})