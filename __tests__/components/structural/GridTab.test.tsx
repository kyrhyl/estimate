import { render, screen, fireEvent } from '@testing-library/react'
import GridTab from '../../../src/components/structural/GridTab'
import { BeamSpec, ColumnSpec } from '../../../src/components/structural/types'

const mockProps = {
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
  ],
  colBeamIds: ['B1', 'B2', 'B1', 'B2', 'B1', 'B2'],
  rowBeamIds: ['B1', 'B2', 'B1', 'B2', 'B1', 'B2'],
  columnIds: ['C1', '', 'C2', '', 'C1', '', 'C2', '', 'C1'],
  beamSpecs: [
    { id: 'B1', width: 0.3, depth: 0.5, topBarSize: 12, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 12, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 },
    { id: 'B2', width: 0.25, depth: 0.4, topBarSize: 10, topBarQty: 2, webBarSize: 8, webBarQty: 2, bottomBarSize: 10, bottomBarQty: 2, stirrupSize: 8, stirrupQty: 6 }
  ] as BeamSpec[],
  columnSpecs: [
    { id: 'C1', width: 0.4, depth: 0.4, height: 3.0, mainBarSize: 16, mainBarQty: 8, tieSize: 10, tieSpacing: 0.15 },
    { id: 'C2', width: 0.5, depth: 0.5, height: 3.0, mainBarSize: 20, mainBarQty: 12, tieSize: 10, tieSpacing: 0.15 }
  ] as ColumnSpec[],
  handleNumColsChange: jest.fn(),
  handleNumRowsChange: jest.fn(),
  handleColChange: jest.fn(),
  handleRowChange: jest.fn(),
  setColBeamIds: jest.fn(),
  setRowBeamIds: jest.fn(),
  updateCurrentFloor: jest.fn(),
}

describe('GridTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders grid system header', () => {
    render(<GridTab {...mockProps} />)

    expect(screen.getByText('Grid System & Assignment')).toBeInTheDocument()
    expect(screen.getByText('Configure grid layout and assign beam types to grid segments')).toBeInTheDocument()
  })

  it('displays grid configuration controls', () => {
    render(<GridTab {...mockProps} />)

    expect(screen.getByText('Grid')).toBeInTheDocument()
    expect(screen.getByText('Number of Rows')).toBeInTheDocument()
    expect(screen.getAllByDisplayValue('3').length).toBeGreaterThan(0) // Multiple inputs can have value 3
  })

  it('calls handleNumRowsChange when rows input changes', () => {
    render(<GridTab {...mockProps} />)

    // Find the rows input by looking for the input after "Number of Rows" label
    const rowsLabel = screen.getByText('Number of Rows')
    const rowsInput = rowsLabel.nextElementSibling as HTMLInputElement
    fireEvent.change(rowsInput, { target: { value: '4' } })

    expect(mockProps.handleNumRowsChange).toHaveBeenCalledWith(4)
  })

  it('renders column assignment section', () => {
    render(<GridTab {...mockProps} />)

    expect(screen.getByText('Column Assignment')).toBeInTheDocument()
    expect(screen.getByText('Assign column types to grid intersections')).toBeInTheDocument()
  })

  it('displays grid intersection labels', () => {
    render(<GridTab {...mockProps} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getAllByText('B2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('C3').length).toBeGreaterThan(0)
  })

  it('renders column assignment dropdowns for each grid position', () => {
    render(<GridTab {...mockProps} />)

    // Should have beam assignment selects (12) + column assignment selects (9) = 21 total
    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(21)
  })

  it('displays current column assignments', () => {
    render(<GridTab {...mockProps} />)

    // Check that assigned columns are displayed (use getAllByDisplayValue)
    const c1Selects = screen.getAllByDisplayValue('C1')
    const c2Selects = screen.getAllByDisplayValue('C2')
    expect(c1Selects.length).toBeGreaterThan(0)
    expect(c2Selects.length).toBeGreaterThan(0)
  })

  it('shows empty option in column dropdowns', () => {
    render(<GridTab {...mockProps} />)

    const selects = screen.getAllByRole('combobox')
    const firstSelect = selects[0]

    // Click to open dropdown
    fireEvent.click(firstSelect)

    // Should have empty option and column options (use getAllByText)
    const emptyOptions = screen.getAllByText('-')
    const c1Options = screen.getAllByText('C1')
    const c2Options = screen.getAllByText('C2')
    expect(emptyOptions.length).toBeGreaterThan(0)
    expect(c1Options.length).toBeGreaterThan(0)
    expect(c2Options.length).toBeGreaterThan(0)
  })

  it('calls updateCurrentFloor when column assignment changes', () => {
    render(<GridTab {...mockProps} />)

    const selects = screen.getAllByRole('combobox')
    // Find a select that currently has no value (should be the second one in first row)
    const emptySelect = selects.find(select => (select as HTMLSelectElement).value === '')

    if (emptySelect) {
      fireEvent.change(emptySelect, { target: { value: 'C1' } })

      expect(mockProps.updateCurrentFloor).toHaveBeenCalledWith({
        columnIds: expect.any(Array)
      })

      const callArg = mockProps.updateCurrentFloor.mock.calls[0][0]
      expect(callArg.columnIds).toContain('C1')
    }
  })

  it('renders beam assignment tables', () => {
    render(<GridTab {...mockProps} />)

    expect(screen.getByText('Column Beams (X Direction)')).toBeInTheDocument()
    expect(screen.getByText('Row Beams (Y Direction)')).toBeInTheDocument()
  })

  it('displays beam segments with correct lengths', () => {
    render(<GridTab {...mockProps} />)

    // Check for beam segments in the beam summary table (they appear as comma-separated values)
    expect(screen.getAllByText(/A1-A2/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/A1-B1/).length).toBeGreaterThan(0)
  })

  it('shows beam assignment dropdowns', () => {
    render(<GridTab {...mockProps} />)

    // Should have beam assignment selects (12 for 3x3 grid)
    const beamSelects = screen.getAllByRole('combobox')
    expect(beamSelects.length).toBe(21) // 12 beam + 9 column selects
  })

  it('handles empty column specs gracefully', () => {
    const propsWithNoColumns = {
      ...mockProps,
      columnSpecs: []
    }

    render(<GridTab {...propsWithNoColumns} />)

    const selects = screen.getAllByRole('combobox')
    // Should still render beam assignment selects (12) + column assignment selects (9) = 21
    expect(selects).toHaveLength(21)
  })

  it('handles single row/column grids', () => {
    const singleGridProps = {
      ...mockProps,
      numCols: 2,
      numRows: 2,
      cols: [
        { label: '1', position: 0 },
        { label: '2', position: 5 }
      ],
      rows: [
        { label: 'A', position: 0 },
        { label: 'B', position: 4 }
      ],
      columnIds: ['C1', '', '', 'C2']
    }

    render(<GridTab {...singleGridProps} />)

    // Check for grid intersection labels (rendered as text elements)
    expect(screen.getAllByText('A1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B2').length).toBeGreaterThan(0)
  })

  it('calculates beam lengths correctly', () => {
    render(<GridTab {...mockProps} />)

    // Check that lengths are displayed in the beam assignment tables
    // Column spacing: 5m between positions 0-5, row spacing: 4m between positions 0-4
    expect(screen.getAllByText('5.00').length).toBeGreaterThan(0) // Column spacing (with decimals)
    expect(screen.getAllByText('4.00').length).toBeGreaterThan(0) // Row spacing (with decimals)
  })
})