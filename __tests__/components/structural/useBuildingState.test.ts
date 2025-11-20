import { renderHook, act } from '@testing-library/react'
import { useBuildingState } from '../../../src/components/structural/useBuildingState'

describe('useBuildingState', () => {
  it('should initialize with default building data', () => {
    const { result } = renderHook(() => useBuildingState())

    expect(result.current.building).toBeDefined()
    expect(result.current.building.name).toBe('Building 1')
    expect(result.current.building.floors).toHaveLength(1)
    expect(result.current.currentFloorId).toBe('floor-1')
  })

  it('should update current floor when updateCurrentFloor is called', () => {
    const { result } = renderHook(() => useBuildingState())

    act(() => {
      result.current.updateCurrentFloor({
        name: 'Updated Floor'
      })
    })

    expect(result.current.currentFloor.name).toBe('Updated Floor')
  })

  it('should add a new floor', () => {
    const { result } = renderHook(() => useBuildingState())

    act(() => {
      result.current.addFloor()
    })

    expect(result.current.building.floors).toHaveLength(2)
    expect(result.current.building.floors[1].level).toBe(2)
    expect(result.current.building.floors[1].name).toBe('Floor 2')
  })

  it('should update column specifications', () => {
    const { result } = renderHook(() => useBuildingState())

    const newColumnSpecs = [
      {
        id: 'C1',
        width: 0.5,
        depth: 0.5,
        height: 3.5,
        mainBarSize: 20,
        mainBarQty: 12,
        tieSize: 10,
        tieSpacing: 0.15
      }
    ]

    act(() => {
      result.current.setColumnSpecs(newColumnSpecs)
    })

    expect(result.current.currentFloor.columnSpecs).toEqual(newColumnSpecs)
  })

  it('should update column IDs for grid assignment', () => {
    const { result } = renderHook(() => useBuildingState())

    const newColumnIds = ['C1', 'C2', '', 'C1']

    act(() => {
      result.current.setColumnIds(newColumnIds)
    })

    expect(result.current.currentFloor.columnIds).toEqual(newColumnIds)
  })
})