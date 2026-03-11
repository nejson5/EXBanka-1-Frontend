import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { EmployeeFilters } from '@/components/employees/EmployeeFilters'

const mockOnFilter = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('EmployeeFilters', () => {
  it('renders search inputs for email, name, position', () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/position/i)).toBeInTheDocument()
  })

  it('calls onFilter when search button is clicked', async () => {
    renderWithProviders(<EmployeeFilters onFilter={mockOnFilter} />)
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'jane')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ email: 'jane' }))
    })
  })
})
