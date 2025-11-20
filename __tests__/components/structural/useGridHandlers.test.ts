import { renderHook, act } from '@testing-library/react'
import { useGridHandlers } from '../../../src/components/structural/useGridHandlers'

describe('useGridHandlers', () => {
  const mockCols = [
    { label: '1', position: 0 },
    { label: '2', position: 5 },
    { label: '3', position: 10 }
  ]

  const mockRows = [
    { label: 'A', position: 0 },
    { label: 'B', position: 4 },
    { label: 'C', position: 8 }
  ]

  const mockSetCols = jest.fn()
  const mockSetRows = jest.fn()
  const mockSetColBeamIds = jest.fn()
  const mockSetRowBeamIds = jest.fn()

  const mockColBeamIds = ['B1', 'B2', 'B1', 'B2', 'B1', 'B2']
  const mockRowBeamIds = ['B1', 'B2', 'B1', 'B2', 'B1', 'B2']

  const setupHook = () => renderHook(() =>
    useGridHandlers(
      mockCols,
      mockRows,
      3,
      mockSetCols,
      mockSetRows,
      mockSetColBeamIds,
      mockSetRowBeamIds,
      mockColBeamIds,
      mockRowBeamIds
    )
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty selected coordinate', () => {
    const { result } = setupHook()

    expect(result.current.selectedCoord).toBe('')
  })

  describe('handleColChange', () => {
    it('should update column label', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleColChange(0, 'label', 'A')
      })

      expect(mockSetCols).toHaveBeenCalledWith([
        { label: 'A', position: 0 },
        { label: '2', position: 5 },
        { label: '3', position: 10 }
      ])
    })

    it('should update column position', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleColChange(1, 'position', '7.5')
      })

      expect(mockSetCols).toHaveBeenCalledWith([
        { label: '1', position: 0 },
        { label: '2', position: 7.5 },
        { label: '3', position: 10 }
      ])
    })

    it('should maintain beam IDs array size', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleColChange(0, 'label', 'A')
      })

      expect(mockSetColBeamIds).toHaveBeenCalledWith(mockColBeamIds)
    })
  })

  describe('handleRowChange', () => {
    it('should update row label', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleRowChange(0, 'label', '1')
      })

      expect(mockSetRows).toHaveBeenCalledWith([
        { label: '1', position: 0 },
        { label: 'B', position: 4 },
        { label: 'C', position: 8 }
      ])
    })

    it('should update row position', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleRowChange(2, 'position', '10')
      })

      expect(mockSetRows).toHaveBeenCalledWith([
        { label: 'A', position: 0 },
        { label: 'B', position: 4 },
        { label: 'C', position: 10 }
      ])
    })

    it('should maintain beam IDs array size', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleRowChange(0, 'label', '1')
      })

      expect(mockSetRowBeamIds).toHaveBeenCalledWith(mockRowBeamIds)
    })
  })

  describe('handleNumColsChange', () => {
    it('should add columns when increasing count', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumColsChange(4)
      })

      expect(mockSetCols).toHaveBeenCalledWith([
        { label: '1', position: 0 },
        { label: '2', position: 5 },
        { label: '3', position: 10 },
        { label: '4', position: 15 }
      ])
    })

    it('should remove columns when decreasing count', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumColsChange(2)
      })

      expect(mockSetCols).toHaveBeenCalledWith([
        { label: '1', position: 0 },
        { label: '2', position: 5 }
      ])
    })

    it('should update beam arrays when columns change', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumColsChange(4)
      })

      // 3 rows × 3 spans = 9 beam positions
      expect(mockSetColBeamIds).toHaveBeenCalledWith(Array(9).fill(''))
      // 4 cols × 2 spans = 8 beam positions
      expect(mockSetRowBeamIds).toHaveBeenCalledWith(Array(8).fill(''))
    })

    it('should reject invalid column counts', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumColsChange(1) // Too few
      })

      act(() => {
        result.current.handleNumColsChange(15) // Too many
      })

      expect(mockSetCols).not.toHaveBeenCalled()
    })
  })

  describe('handleNumRowsChange', () => {
    it('should add rows when increasing count', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumRowsChange(4)
      })

      expect(mockSetRows).toHaveBeenCalledWith([
        { label: 'A', position: 0 },
        { label: 'B', position: 4 },
        { label: 'C', position: 8 },
        { label: 'D', position: 12 }
      ])
    })

    it('should remove rows when decreasing count', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumRowsChange(2)
      })

      expect(mockSetRows).toHaveBeenCalledWith([
        { label: 'A', position: 0 },
        { label: 'B', position: 4 }
      ])
    })

    it('should update beam arrays when rows change', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumRowsChange(4)
      })

      // 4 rows × 2 spans = 8 beam positions
      expect(mockSetColBeamIds).toHaveBeenCalledWith(Array(8).fill(''))
    })

    it('should reject invalid row counts', () => {
      const { result } = setupHook()

      act(() => {
        result.current.handleNumRowsChange(1) // Too few
      })

      act(() => {
        result.current.handleNumRowsChange(15) // Too many
      })

      expect(mockSetRows).not.toHaveBeenCalled()
    })
  })

  describe('selectedCoord state', () => {
    it('should allow setting selected coordinate', () => {
      const { result } = setupHook()

      act(() => {
        result.current.setSelectedCoord('A1')
      })

      expect(result.current.selectedCoord).toBe('A1')
    })
  })
})