import { screen, waitFor, act, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'

const mockOnFilter = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('EmployeeFilters', () => {
  it('renders a single search input', () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    expect(screen.getByPlaceholderText(/search by name, email or position/i)).toBeInTheDocument()
  })

  it('debounces and calls onFilter with email when input contains @', async () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    const input = screen.getByPlaceholderText(/search by name, email or position/i)

    fireEvent.change(input, { target: { value: 'jane@example.com' } })
    act(() => jest.runAllTimers())

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' })
      )
    })
  })

  it('debounces and calls onFilter with name when input has no @', async () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    const input = screen.getByPlaceholderText(/search by name, email or position/i)

    fireEvent.change(input, { target: { value: 'Jane' } })
    act(() => jest.runAllTimers())

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane' }))
    })
  })

  it('calls onFilter with empty object when input is cleared', async () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    const input = screen.getByPlaceholderText(/search by name, email or position/i)

    fireEvent.change(input, { target: { value: 'Jane' } })
    fireEvent.change(input, { target: { value: '' } })
    act(() => jest.runAllTimers())

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({})
    })
  })
})
