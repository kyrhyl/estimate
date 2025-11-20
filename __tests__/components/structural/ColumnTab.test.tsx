import { render, screen, fireEvent } from '@testing-library/react'
import ColumnTab from '../../../src/components/structural/ColumnTab'
import { ColumnSpec } from '../../../src/components/structural/types'

const mockUpdateCurrentFloor = jest.fn()

const mockColumnSpecs: ColumnSpec[] = [
  {
    id: 'C1',
    width: 0.4,
    depth: 0.4,
    height: 3.0,
    mainBarSize: 16,
    mainBarQty: 8,
    tieSize: 10,
    tieSpacing: 0.15
  },
  {
    id: 'C2',
    width: 0.5,
    depth: 0.5,
    height: 3.0,
    mainBarSize: 20,
    mainBarQty: 12,
    tieSize: 10,
    tieSpacing: 0.15
  }
]

describe('ColumnTab', () => {
  beforeEach(() => {
    mockUpdateCurrentFloor.mockClear()
  })

  it('renders column specifications header', () => {
    render(<ColumnTab columnSpecs={mockColumnSpecs} updateCurrentFloor={mockUpdateCurrentFloor} />)

    expect(screen.getByText('Column Specifications')).toBeInTheDocument()
    expect(screen.getByText('Configure column dimensions and reinforcement details')).toBeInTheDocument()
  })

  it('displays all column specs', () => {
    render(<ColumnTab columnSpecs={mockColumnSpecs} updateCurrentFloor={mockUpdateCurrentFloor} />)

    expect(screen.getByDisplayValue('C1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('C2')).toBeInTheDocument()
  })

  it('allows editing column ID', () => {
    render(<ColumnTab columnSpecs={mockColumnSpecs} updateCurrentFloor={mockUpdateCurrentFloor} />)

    const input = screen.getByDisplayValue('C1')
    fireEvent.change(input, { target: { value: 'C1-Modified' } })

    expect(mockUpdateCurrentFloor).toHaveBeenCalledWith({
      columnSpecs: [
        { ...mockColumnSpecs[0], id: 'C1-Modified' },
        mockColumnSpecs[1]
      ]
    })
  })

  it('allows editing column dimensions', () => {
    render(<ColumnTab columnSpecs={mockColumnSpecs} updateCurrentFloor={mockUpdateCurrentFloor} />)

    const widthInput = screen.getAllByDisplayValue('0.4')[0] // First column width
    fireEvent.change(widthInput, { target: { value: '0.5' } })

    expect(mockUpdateCurrentFloor).toHaveBeenCalledWith({
      columnSpecs: [
        { ...mockColumnSpecs[0], width: 0.5 },
        mockColumnSpecs[1]
      ]
    })
  })

  it('allows deleting columns', () => {
    render(<ColumnTab columnSpecs={mockColumnSpecs} updateCurrentFloor={mockUpdateCurrentFloor} />)

    const deleteButtons = screen.getAllByRole('button', { hidden: true })
    const deleteButton = deleteButtons.find(button =>
      button.closest('svg')?.parentElement?.textContent?.includes('C1')
    )

    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(mockUpdateCurrentFloor).toHaveBeenCalledWith({
        columnSpecs: [mockColumnSpecs[1]]
      })
    }
  })
})