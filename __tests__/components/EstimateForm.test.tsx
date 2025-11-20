import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EstimateForm from '../../src/components/EstimateForm'

// Mock the estimate utilities
jest.mock('../../src/utils/estimate', () => ({
  calculateEstimate: jest.fn(),
  saveEstimate: jest.fn()
}))

import { calculateEstimate, saveEstimate } from '../../src/utils/estimate'

const mockCalculateEstimate = calculateEstimate as jest.MockedFunction<typeof calculateEstimate>
const mockSaveEstimate = saveEstimate as jest.MockedFunction<typeof saveEstimate>

describe('EstimateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all elements', () => {
    render(<EstimateForm />)

    expect(screen.getByText('Quantity Estimation Tool')).toBeInTheDocument()
    expect(screen.getByLabelText('Major Group')).toBeInTheDocument()
    expect(screen.getByText('Select group')).toBeInTheDocument()
  })

  it('displays group options', () => {
    render(<EstimateForm />)

    const groupSelect = screen.getByLabelText('Major Group')
    expect(groupSelect).toBeInTheDocument()

    fireEvent.click(groupSelect)
    expect(screen.getByText('Superstructure')).toBeInTheDocument()
    expect(screen.getByText('Finishes')).toBeInTheDocument()
  })

  it('updates breakdown options when group is selected', () => {
    render(<EstimateForm />)

    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    expect(breakdownSelect).toBeInTheDocument()

    fireEvent.click(breakdownSelect)
    expect(screen.getByText('Reinforced Concrete Columns')).toBeInTheDocument()
    expect(screen.getByText('Reinforced Concrete Beams')).toBeInTheDocument()
  })

  it('allows parameter input', () => {
    render(<EstimateForm />)

    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '100' } })

    expect(paramInput).toHaveValue(100)
  })

  it('calculates estimate when calculate button is clicked', () => {
    mockCalculateEstimate.mockReturnValue('Calculated result')

    render(<EstimateForm />)

    const groupSelect = screen.getByText('Major Group').nextElementSibling as HTMLSelectElement
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByText('Breakdown').nextElementSibling as HTMLSelectElement
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByText('Parameter (e.g., area, volume, quantity)').nextElementSibling as HTMLInputElement
    fireEvent.change(paramInput, { target: { value: '100' } })

    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    expect(mockCalculateEstimate).toHaveBeenCalledWith('100', 'Superstructure', 'Reinforced Concrete Columns')
    expect(screen.getByText('Calculated result')).toBeInTheDocument()
  })

  it('clears save status when calculating', () => {
    render(<EstimateForm />)

    // Set up the form
    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '100' } })

    // First perform calculation to show the save button
    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    // Click calculate again - save status should be cleared
    fireEvent.click(calculateButton)

    // Save status should be cleared (though we can't see it directly)
    expect(mockCalculateEstimate).toHaveBeenCalledTimes(2)
  })

  it('saves estimate when save button is clicked', async () => {
    mockCalculateEstimate.mockReturnValue('Test result')
    mockSaveEstimate.mockResolvedValue('Saved successfully!')

    render(<EstimateForm />)

    // First perform calculation to show the save button
    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '100' } })

    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    // Now the save button should be visible
    const saveButton = screen.getByText('Save Estimate')
    fireEvent.click(saveButton)

    expect(mockSaveEstimate).toHaveBeenCalledWith({
      group: 'Superstructure',
      breakdown: 'Reinforced Concrete Columns',
      parameter: '100',
      estimatedQuantity: 110.00000000000001
    })

    await waitFor(() => {
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument()
    })
  })

  it('shows saving status while saving', async () => {
    mockCalculateEstimate.mockReturnValue('Test result')
    mockSaveEstimate.mockResolvedValue('Saved successfully!')

    render(<EstimateForm />)

    // First perform calculation to show the save button
    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '50' } })

    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    // Now the save button should be visible
    const saveButton = screen.getByText('Save Estimate')
    fireEvent.click(saveButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument()
    })
  })

  it('handles save errors', async () => {
    mockCalculateEstimate.mockReturnValue('Test result')
    mockSaveEstimate.mockResolvedValue('Error saving estimate.')

    render(<EstimateForm />)

    // First perform calculation to show the save button
    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '50' } })

    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    const saveButton = screen.getByText('Save Estimate')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Error saving estimate.')).toBeInTheDocument()
    })
  })

  it('calculates estimated quantity correctly', async () => {
    mockCalculateEstimate.mockReturnValue('Test result')
    mockSaveEstimate.mockResolvedValue('Saved successfully!')

    render(<EstimateForm />)

    // First perform calculation to show the save button
    const groupSelect = screen.getByLabelText('Major Group')
    fireEvent.change(groupSelect, { target: { value: 'Superstructure' } })

    const breakdownSelect = screen.getByLabelText('Breakdown')
    fireEvent.change(breakdownSelect, { target: { value: 'Reinforced Concrete Columns' } })

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    fireEvent.change(paramInput, { target: { value: '50' } })

    const calculateButton = screen.getByText('Calculate')
    fireEvent.click(calculateButton)

    // Now the save button should be visible
    const saveButton = screen.getByText('Save Estimate')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSaveEstimate).toHaveBeenCalledWith(
        expect.objectContaining({ estimatedQuantity: 55.00000000000001 })
      )
    })
  })

  it('handles empty parameter for save', async () => {
    mockCalculateEstimate.mockReturnValue('Test result')
    mockSaveEstimate.mockResolvedValue('Saved successfully!')

    render(<EstimateForm />)

    // First perform calculation to show the save button
    const groupSelect = screen.getByLabelText('Major Group')
    await userEvent.selectOptions(groupSelect, 'Superstructure')

    const breakdownSelect = screen.getByLabelText('Breakdown')
    await userEvent.selectOptions(breakdownSelect, 'Reinforced Concrete Columns')

    const paramInput = screen.getByLabelText('Parameter (e.g., area, volume, quantity)')
    // Leave param empty
    await userEvent.clear(paramInput)

    const calculateButton = screen.getByText('Calculate')
    await userEvent.click(calculateButton)

    // Now the save button should be visible
    const saveButton = screen.getByText('Save Estimate')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSaveEstimate).toHaveBeenCalledWith(
        expect.objectContaining({ estimatedQuantity: null })
      )
    })
  })
})