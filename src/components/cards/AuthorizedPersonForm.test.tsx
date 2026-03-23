import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AuthorizedPersonForm } from '@/components/cards/AuthorizedPersonForm'

describe('AuthorizedPersonForm', () => {
  it('renders form fields', () => {
    renderWithProviders(<AuthorizedPersonForm onSubmit={jest.fn()} loading={false} />)
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
