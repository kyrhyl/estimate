import { render, screen, fireEvent } from '@testing-library/react'
import TabNavigation from '../../../src/components/structural/TabNavigation'

describe('TabNavigation', () => {
  const mockOnTabChange = jest.fn()

  beforeEach(() => {
    mockOnTabChange.mockClear()
  })

  it('renders all tab buttons', () => {
    render(<TabNavigation activeTab="beams" onTabChange={mockOnTabChange} />)

    expect(screen.getByText('Beam Specifications')).toBeInTheDocument()
    expect(screen.getByText('Column Specifications')).toBeInTheDocument()
    expect(screen.getByText('Slab Specifications')).toBeInTheDocument()
    expect(screen.getByText('Grid System')).toBeInTheDocument()
    expect(screen.getByText('Building Summary')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(<TabNavigation activeTab="columns" onTabChange={mockOnTabChange} />)

    const activeButton = screen.getByText('Column Specifications')
    expect(activeButton).toHaveClass('border-blue-500', 'text-blue-600')

    const inactiveButton = screen.getByText('Beam Specifications')
    expect(inactiveButton).toHaveClass('border-transparent', 'text-gray-500')
  })

  it('calls onTabChange when a tab is clicked', () => {
    render(<TabNavigation activeTab="beams" onTabChange={mockOnTabChange} />)

    const gridTab = screen.getByText('Grid System')
    fireEvent.click(gridTab)

    expect(mockOnTabChange).toHaveBeenCalledWith('grid')
    expect(mockOnTabChange).toHaveBeenCalledTimes(1)
  })

  it('calls onTabChange with correct tab id for each tab', () => {
    render(<TabNavigation activeTab="beams" onTabChange={mockOnTabChange} />)

    fireEvent.click(screen.getByText('Beam Specifications'))
    expect(mockOnTabChange).toHaveBeenLastCalledWith('beams')

    fireEvent.click(screen.getByText('Column Specifications'))
    expect(mockOnTabChange).toHaveBeenLastCalledWith('columns')

    fireEvent.click(screen.getByText('Slab Specifications'))
    expect(mockOnTabChange).toHaveBeenLastCalledWith('slabs')

    fireEvent.click(screen.getByText('Grid System'))
    expect(mockOnTabChange).toHaveBeenLastCalledWith('grid')

    fireEvent.click(screen.getByText('Building Summary'))
    expect(mockOnTabChange).toHaveBeenLastCalledWith('summary')
  })

  it('applies correct styling to inactive tabs', () => {
    render(<TabNavigation activeTab="beams" onTabChange={mockOnTabChange} />)

    const inactiveTab = screen.getByText('Column Specifications')
    expect(inactiveTab).toHaveClass(
      'border-transparent',
      'text-gray-500',
      'hover:text-gray-700',
      'hover:border-gray-300'
    )
  })

  it('renders with sticky positioning and proper layout', () => {
    const { container } = render(<TabNavigation activeTab="beams" onTabChange={mockOnTabChange} />)

    const navContainer = container.firstChild as HTMLElement
    expect(navContainer).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'sticky', 'top-0', 'z-10')
  })
})