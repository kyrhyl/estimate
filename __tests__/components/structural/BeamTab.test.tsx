import { render, screen, fireEvent } from '@testing-library/react'
import BeamTab from '../../../src/components/structural/BeamTab'
import { BeamSpec } from '../../../src/components/structural/types'

const mockSetBeamSpecs = jest.fn()

const mockBeamSpecs: BeamSpec[] = [
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
  },
  {
    id: 'B2',
    width: 0.25,
    depth: 0.4,
    topBarSize: 10,
    topBarQty: 2,
    webBarSize: 8,
    webBarQty: 2,
    bottomBarSize: 10,
    bottomBarQty: 2,
    stirrupSize: 8,
    stirrupQty: 6
  }
]

describe('BeamTab', () => {
  beforeEach(() => {
    mockSetBeamSpecs.mockClear()
  })

  it('renders beam specifications header', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    expect(screen.getByText('Beam Specifications')).toBeInTheDocument()
    expect(screen.getByText('Configure beam dimensions and reinforcement details')).toBeInTheDocument()
  })

  it('displays all beam specs', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    expect(screen.getByDisplayValue('B1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('B2')).toBeInTheDocument()
  })

  it('allows editing beam ID', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const input = screen.getByDisplayValue('B1')
    fireEvent.change(input, { target: { value: 'B1-Modified' } })

    expect(mockSetBeamSpecs).toHaveBeenCalledWith([
      { ...mockBeamSpecs[0], id: 'B1-Modified' },
      mockBeamSpecs[1]
    ])
  })

  it('prevents duplicate beam IDs', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const input = screen.getByDisplayValue('B1')
    fireEvent.change(input, { target: { value: 'B2' } }) // Try to change B1 to B2 (duplicate)

    expect(mockSetBeamSpecs).not.toHaveBeenCalled()
  })

  it('allows editing beam dimensions', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const widthInputs = screen.getAllByDisplayValue('0.3')
    const widthInput = widthInputs[0] // First beam width
    fireEvent.change(widthInput, { target: { value: '0.35' } })

    expect(mockSetBeamSpecs).toHaveBeenCalledWith([
      { ...mockBeamSpecs[0], width: 0.35 },
      mockBeamSpecs[1]
    ])
  })

  it('allows editing reinforcement details', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const topBarQtyInputs = screen.getAllByDisplayValue('2')
    const topBarQtyInput = topBarQtyInputs[0] // First beam top bar quantity
    fireEvent.change(topBarQtyInput, { target: { value: '3' } })

    expect(mockSetBeamSpecs).toHaveBeenCalledWith([
      { ...mockBeamSpecs[0], topBarQty: 3 },
      mockBeamSpecs[1]
    ])
  })

  it('allows selecting bar sizes from dropdown', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const selectElements = screen.getAllByDisplayValue('12mm')
    const topBarSizeSelect = selectElements[0] // First beam top bar size
    fireEvent.change(topBarSizeSelect, { target: { value: '16' } })

    expect(mockSetBeamSpecs).toHaveBeenCalledWith([
      { ...mockBeamSpecs[0], topBarSize: 16 },
      mockBeamSpecs[1]
    ])
  })

  it('allows deleting beams', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const deleteButtons = screen.getAllByRole('button', { hidden: true })
    const deleteButton = deleteButtons.find(button =>
      button.closest('.bg-white')?.textContent?.includes('B1')
    )

    if (deleteButton) {
      fireEvent.click(deleteButton)
      expect(mockSetBeamSpecs).toHaveBeenCalledWith([mockBeamSpecs[1]])
    }
  })

  it('shows add beam button', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const addButton = screen.getByText('Add New Beam')
    expect(addButton).toBeInTheDocument()
  })

  it('adds new beam when add button is clicked', () => {
    render(<BeamTab beamSpecs={mockBeamSpecs} setBeamSpecs={mockSetBeamSpecs} />)

    const addButton = screen.getByText('Add New Beam')
    fireEvent.click(addButton)

    expect(mockSetBeamSpecs).toHaveBeenCalledWith([
      ...mockBeamSpecs,
      {
        id: 'B3',
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
    ])
  })

  it('handles empty beam specs array', () => {
    render(<BeamTab beamSpecs={[]} setBeamSpecs={mockSetBeamSpecs} />)

    expect(screen.getByText('Beam Specifications')).toBeInTheDocument()
    expect(screen.getByText('Add New Beam')).toBeInTheDocument()
  })
})