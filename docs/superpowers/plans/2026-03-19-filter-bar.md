# FilterBar Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all page-specific filter components with a single reusable `FilterBar` that renders text/date/number inputs and a multi-select checkbox dropdown (with Select All) for enum fields.

**Architecture:** Two new shared components — `MultiselectDropdown` (Popover + checkboxes, manages open/close state internally) and `FilterBar` (fully controlled, renders correct input per field type). Each page defines its own `FilterFieldDef[]` and maps `FilterValues` to its API type. All old filter components deleted.

**Tech Stack:** React 19, TypeScript, Shadcn UI (Popover, Button, Input), TanStack Query, Jest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-19-filter-bar-design.md`

---

## Task 1: Install Popover + create types + create Popover test mock

**Files:**
- Run: `npx shadcn@latest add popover`
- Create: `src/types/filters.ts`
- Create: `src/__tests__/mocks/popover-mock.tsx`

- [ ] **Step 1: Install Shadcn Popover**

```bash
npx shadcn@latest add popover
```

Expected: `src/components/ui/popover.tsx` created.

- [ ] **Step 2: Create `src/types/filters.ts`**

```typescript
export interface FilterOption {
  label: string
  value: string
}

export type FilterFieldDef =
  | { key: string; label: string; type: 'text' | 'date' | 'number' }
  | { key: string; label: string; type: 'multiselect'; options: FilterOption[] }

export type FilterValues = Record<string, string | string[]>
```

- [ ] **Step 3: Create `src/__tests__/mocks/popover-mock.tsx`**

```tsx
import { createContext, useContext, useState } from 'react'
import React from 'react'

const PopoverContext = createContext<{
  open: boolean
  setOpen: (v: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children?: React.ReactNode
  asChild?: boolean
}) {
  const { setOpen, open } = useContext(PopoverContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(!open),
    })
  }
  return <button onClick={() => setOpen(!open)}>{children}</button>
}

export function PopoverContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { open } = useContext(PopoverContext)
  if (!open) return null
  return <div data-testid="popover-content" className={className}>{children}</div>
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/filters.ts src/__tests__/mocks/popover-mock.tsx
git commit -m "feat: add FilterValues/FilterFieldDef types and Popover test mock"
```

---

## Task 2: TDD — MultiselectDropdown

**Files:**
- Create: `src/components/ui/MultiselectDropdown.test.tsx`
- Create: `src/components/ui/MultiselectDropdown.tsx`

- [ ] **Step 1: Write failing tests in `src/components/ui/MultiselectDropdown.test.tsx`**

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { MultiselectDropdown } from '@/components/ui/MultiselectDropdown'

jest.mock('@/components/ui/popover', () => require('@/__tests__/mocks/popover-mock'))

const OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
]

describe('MultiselectDropdown', () => {
  it('renders trigger button with label when nothing selected', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument()
  })

  it('shows count in trigger when items selected', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B']} onChange={jest.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Status (2)' })).toBeInTheDocument()
  })

  it('does not show dropdown content when closed', () => {
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument()
  })

  it('shows options when trigger is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
    expect(screen.getByLabelText('Izaberi sve')).toBeInTheDocument()
    expect(screen.getByLabelText('Option A')).toBeInTheDocument()
    expect(screen.getByLabelText('Option B')).toBeInTheDocument()
    expect(screen.getByLabelText('Option C')).toBeInTheDocument()
  })

  it('calls onChange with all values when Select All clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    await user.click(screen.getByLabelText('Izaberi sve'))
    expect(onChange).toHaveBeenCalledWith(['A', 'B', 'C'])
  })

  it('calls onChange with empty array when Select All clicked and all are selected', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B', 'C']} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (3)' }))
    await user.click(screen.getByLabelText('Izaberi sve'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('calls onChange with single value when one option clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={[]} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    await user.click(screen.getByLabelText('Option B'))
    expect(onChange).toHaveBeenCalledWith(['B'])
  })

  it('removes value when already-selected option clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B']} onChange={onChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (2)' }))
    await user.click(screen.getByLabelText('Option A'))
    expect(onChange).toHaveBeenCalledWith(['B'])
  })

  it('shows Select All as checked when all options are selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A', 'B', 'C']} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (3)' }))
    expect(screen.getByLabelText('Izaberi sve')).toBeChecked()
  })

  it('shows Select All as unchecked when not all options are selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MultiselectDropdown label="Status" options={OPTIONS} selected={['A']} onChange={jest.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Status (1)' }))
    expect(screen.getByLabelText('Izaberi sve')).not.toBeChecked()
  })
})
```

- [ ] **Step 2: Run tests — confirm they FAIL**

```bash
npm test -- --testPathPattern="MultiselectDropdown.test" --no-coverage
```

Expected: FAIL — `MultiselectDropdown` not found.

- [ ] **Step 3: Implement `src/components/ui/MultiselectDropdown.tsx`**

```tsx
import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { FilterOption } from '@/types/filters'

interface MultiselectDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiselectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiselectDropdownProps) {
  const [open, setOpen] = useState(false)
  const allSelected = options.length > 0 && selected.length === options.length

  const handleSelectAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.value))
  }

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const triggerLabel = selected.length > 0 ? `${label} (${selected.length})` : label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button">
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <label className="flex items-center gap-2 px-2 py-1 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label="Izaberi sve"
            />
            Izaberi sve
          </label>
          <div className="border-t my-1" />
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                aria-label={opt.label}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 4: Run tests — confirm they PASS**

```bash
npm test -- --testPathPattern="MultiselectDropdown.test" --no-coverage
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/MultiselectDropdown.tsx src/components/ui/MultiselectDropdown.test.tsx
git commit -m "feat: add MultiselectDropdown component with Select All support"
```

---

## Task 3: TDD — FilterBar

**Files:**
- Create: `src/components/ui/FilterBar.test.tsx`
- Create: `src/components/ui/FilterBar.tsx`

- [ ] **Step 1: Write failing tests in `src/components/ui/FilterBar.test.tsx`**

```tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { FilterBar } from '@/components/ui/FilterBar'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

jest.mock('@/components/ui/MultiselectDropdown', () => ({
  MultiselectDropdown: ({
    label,
    selected,
    onChange,
  }: {
    label: string
    options: { label: string; value: string }[]
    selected: string[]
    onChange: (v: string[]) => void
  }) => (
    <div>
      <span data-testid={`multiselect-${label}`}>
        {label} ({selected.length})
      </span>
      <button onClick={() => onChange(['VAL1'])}>trigger-{label}</button>
    </div>
  ),
}))

const TEXT_FIELD: FilterFieldDef = { key: 'name', label: 'Ime', type: 'text' }
const DATE_FIELD: FilterFieldDef = { key: 'date_from', label: 'Od datuma', type: 'date' }
const NUMBER_FIELD: FilterFieldDef = { key: 'amount', label: 'Iznos', type: 'number' }
const MULTI_FIELD: FilterFieldDef = {
  key: 'status',
  label: 'Status',
  type: 'multiselect',
  options: [{ label: 'Aktivan', value: 'ACTIVE' }],
}

describe('FilterBar', () => {
  it('renders text input for text field', () => {
    renderWithProviders(<FilterBar fields={[TEXT_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Ime')).toBeInTheDocument()
  })

  it('renders date input for date field', () => {
    renderWithProviders(<FilterBar fields={[DATE_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Od datuma')).toHaveAttribute('type', 'date')
  })

  it('renders number input for number field', () => {
    renderWithProviders(<FilterBar fields={[NUMBER_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Iznos')).toHaveAttribute('type', 'number')
  })

  it('renders MultiselectDropdown for multiselect field', () => {
    renderWithProviders(<FilterBar fields={[MULTI_FIELD]} values={{}} onChange={jest.fn()} />)
    expect(screen.getByTestId('multiselect-Status')).toBeInTheDocument()
  })

  it('calls onChange with updated text value', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[TEXT_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Ime'), { target: { value: 'Ana' } })
    expect(onChange).toHaveBeenCalledWith({ name: 'Ana' })
  })

  it('calls onChange with updated date value', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[DATE_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Od datuma'), { target: { value: '2024-01-01' } })
    expect(onChange).toHaveBeenCalledWith({ date_from: '2024-01-01' })
  })

  it('calls onChange with updated number value as string', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[NUMBER_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Iznos'), { target: { value: '100' } })
    expect(onChange).toHaveBeenCalledWith({ amount: '100' })
  })

  it('calls onChange with updated array from multiselect', () => {
    const onChange = jest.fn()
    renderWithProviders(<FilterBar fields={[MULTI_FIELD]} values={{}} onChange={onChange} />)
    fireEvent.click(screen.getByText('trigger-Status'))
    expect(onChange).toHaveBeenCalledWith({ status: ['VAL1'] })
  })

  it('preserves existing values when one field changes', () => {
    const onChange = jest.fn()
    renderWithProviders(
      <FilterBar
        fields={[TEXT_FIELD, DATE_FIELD]}
        values={{ name: 'Ana' }}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Od datuma'), { target: { value: '2024-01-01' } })
    expect(onChange).toHaveBeenCalledWith({ name: 'Ana', date_from: '2024-01-01' })
  })

  it('shows current values in inputs', () => {
    renderWithProviders(
      <FilterBar
        fields={[TEXT_FIELD]}
        values={{ name: 'Marko' }}
        onChange={jest.fn()}
      />
    )
    expect(screen.getByPlaceholderText('Ime')).toHaveValue('Marko')
  })
})
```

- [ ] **Step 2: Run tests — confirm they FAIL**

```bash
npm test -- --testPathPattern="FilterBar.test" --no-coverage
```

Expected: FAIL — `FilterBar` not found.

- [ ] **Step 3: Implement `src/components/ui/FilterBar.tsx`**

```tsx
import { Input } from '@/components/ui/input'
import { MultiselectDropdown } from '@/components/ui/MultiselectDropdown'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

interface FilterBarProps {
  fields: FilterFieldDef[]
  values: FilterValues
  onChange: (values: FilterValues) => void
}

export function FilterBar({ fields, values, onChange }: FilterBarProps) {
  const handleChange = (key: string, value: string | string[]) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      {fields.map((field) => {
        if (field.type === 'multiselect') {
          return (
            <MultiselectDropdown
              key={field.key}
              label={field.label}
              options={field.options}
              selected={(values[field.key] as string[]) ?? []}
              onChange={(v) => handleChange(field.key, v)}
            />
          )
        }
        return (
          <Input
            key={field.key}
            type={field.type}
            placeholder={field.label}
            value={(values[field.key] as string) ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="max-w-[200px]"
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm they PASS**

```bash
npm test -- --testPathPattern="FilterBar.test" --no-coverage
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm test --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/FilterBar.tsx src/components/ui/FilterBar.test.tsx
git commit -m "feat: add FilterBar component"
```

---

## Task 4: Migrate EmployeeListPage

**Files:**
- Modify: `src/pages/EmployeeListPage.tsx`
- Modify: `src/types/employee.ts` (remove `FilterCategory`)

Note: page-level filter tests are out of scope. The existing `EmployeeFilters` tests will be deleted in Task 10.

- [ ] **Step 1: Replace `EmployeeListPage.tsx`**

Replace the entire file content with:

```tsx
import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { EmployeeProfileTab } from '@/components/employees/EmployeeProfileTab'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useEmployees } from '@/hooks/useEmployees'
import type { EmployeeFilters as EmployeeFiltersType } from '@/types/employee'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAGE_SIZE = 20

const EMPLOYEE_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
]

export function EmployeeListPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [page, setPage] = useState(1)

  const apiFilters: EmployeeFiltersType = {
    page,
    page_size: PAGE_SIZE,
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
    position: (filterValues.position as string) || undefined,
  }

  const { data, isLoading } = useEmployees(apiFilters)
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters)
    setPage(1)
  }

  const handleRowClick = useCallback((id: number) => navigate(`/employees/${id}`), [navigate])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center rounded-lg bg-accent-2 px-2.5 py-1.5 text-sm font-medium text-accent-2-foreground transition-colors hover:bg-accent-2/90"
        >
          Create Employee
        </Link>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="mb-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="me">Me</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <FilterBar
            fields={EMPLOYEE_FILTER_FIELDS}
            values={filterValues}
            onChange={handleFilterChange}
          />

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.employees.length ? (
            <>
              <EmployeeTable employees={data.employees} onRowClick={handleRowClick} />
              <p className="text-sm text-muted-foreground mt-2">{data.total_count} employees</p>
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <p>No employees found.</p>
          )}
        </TabsContent>

        <TabsContent value="me">
          <EmployeeProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Remove `FilterCategory` from `src/types/employee.ts`**

Delete the last line:
```typescript
export type FilterCategory = 'name' | 'email' | 'position'
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Run tests**

```bash
npm test --no-coverage
```

Expected: all tests PASS (EmployeeFilters tests may fail — that's fine, they'll be deleted in Task 10).

- [ ] **Step 5: Commit**

```bash
git add src/pages/EmployeeListPage.tsx src/types/employee.ts
git commit -m "feat: migrate EmployeeListPage to FilterBar"
```

---

## Task 5: Migrate AdminClientsPage

**Files:**
- Modify: `src/pages/AdminClientsPage.tsx`

- [ ] **Step 1: Replace `AdminClientsPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ClientTable } from '@/components/admin/ClientTable'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const CLIENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'name', label: 'Ime', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const { data, isLoading } = useAllClients({
    name: (filterValues.name as string) || undefined,
    email: (filterValues.email as string) || undefined,
  })
  const clients = data?.clients ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
        <Button onClick={() => navigate('/admin/clients/new')}>Novi klijent</Button>
      </div>

      <FilterBar
        fields={CLIENT_FILTER_FIELDS}
        values={filterValues}
        onChange={setFilterValues}
      />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(clientId) => navigate(`/admin/clients/${clientId}`)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript + tests**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero TS errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminClientsPage.tsx
git commit -m "feat: migrate AdminClientsPage to FilterBar"
```

---

## Task 6: Migrate AdminAccountsPage

**Files:**
- Modify: `src/pages/AdminAccountsPage.tsx`

- [ ] **Step 1: Replace `AdminAccountsPage.tsx`**

```tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllAccounts } from '@/hooks/useAccounts'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/FilterBar'
import { AccountTable } from '@/components/admin/AccountTable'
import { filterAccountsByOwner } from '@/lib/utils/accountFilters'
import type { Client } from '@/types/client'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const ACCOUNT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'owner_name', label: 'Ime vlasnika', type: 'text' },
  { key: 'account_number', label: 'Broj računa', type: 'text' },
]

export function AdminAccountsPage() {
  const navigate = useNavigate()
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const { data, isLoading } = useAllAccounts({
    account_number_filter: (filterValues.account_number as string) || undefined,
  })
  const { data: clientsData } = useAllClients()
  const clientsById = useMemo(
    () =>
      (clientsData?.clients ?? []).reduce<Record<number, Client>>(
        (acc, client) => ({ ...acc, [client.id]: client }),
        {}
      ),
    [clientsData]
  )
  const accounts = useMemo(
    () =>
      filterAccountsByOwner(
        data?.accounts ?? [],
        clientsById,
        (filterValues.owner_name as string) ?? ''
      ),
    [data, clientsById, filterValues.owner_name]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje računima</h1>
        <Button onClick={() => navigate('/accounts/new')}>Novi račun</Button>
      </div>
      <FilterBar
        fields={ACCOUNT_FILTER_FIELDS}
        values={filterValues}
        onChange={setFilterValues}
      />
      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <AccountTable
          accounts={accounts}
          onViewCards={(id) => navigate(`/admin/accounts/${id}/cards`)}
          clientsById={clientsById}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript + tests**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminAccountsPage.tsx
git commit -m "feat: migrate AdminAccountsPage to FilterBar"
```

---

## Task 7: Migrate AdminLoansPage

**Files:**
- Modify: `src/pages/AdminLoansPage.tsx`

- [ ] **Step 1: Replace `AdminLoansPage.tsx`**

Keep all existing table JSX. Replace only the filter state + component import + filter UI:

```tsx
import { useState } from 'react'
import { useAllLoans } from '@/hooks/useLoans'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/ui/FilterBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { LoanFilters as LoanFiltersType, LoanType, LoanStatus } from '@/types/loan'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivan',
  PAID_OFF: 'Isplaćen',
  DELINQUENT: 'U kašnjenju',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  PAID_OFF: 'secondary',
  DELINQUENT: 'destructive',
}
const INTEREST_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Fiksna',
  VARIABLE: 'Varijabilna',
}

const LOAN_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: 'loan_type',
    label: 'Tip kredita',
    type: 'multiselect',
    options: LOAN_TYPES.map((t) => ({ label: t.label, value: t.value })),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Aktivan', value: 'ACTIVE' },
      { label: 'Isplaćen', value: 'PAID_OFF' },
      { label: 'Neizmiren', value: 'DELINQUENT' },
    ],
  },
  { key: 'account_number', label: 'Broj računa', type: 'text' },
]

export function AdminLoansPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const apiFilters: LoanFiltersType = {
    loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
    status: (filterValues.status as string[])?.[0] as LoanStatus | undefined,
    account_number: (filterValues.account_number as string) || undefined,
  }
  const { data, isLoading } = useAllLoans(apiFilters)
  const loans = data?.loans ?? []
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Svi krediti</h1>

      <FilterBar
        fields={LOAN_FILTER_FIELDS}
        values={filterValues}
        onChange={setFilterValues}
      />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broj kredita</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Tip kamate</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Rata</TableHead>
              <TableHead>Preostalo dugovanje</TableHead>
              <TableHead>Valuta</TableHead>
              <TableHead>Odobren</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const currency = loan.currency_code ?? 'RSD'
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono text-sm">{loan.loan_number}</TableCell>
                  <TableCell>{loanTypeLabel(loan.loan_type)}</TableCell>
                  <TableCell>
                    {loan.interest_type ? (INTEREST_TYPE_LABELS[loan.interest_type] ?? '—') : '—'}
                  </TableCell>
                  <TableCell>{formatCurrency(loan.amount, currency)}</TableCell>
                  <TableCell>{loan.period} mes.</TableCell>
                  <TableCell>{formatCurrency(loan.installment_amount, currency)}</TableCell>
                  <TableCell>
                    {loan.remaining_debt !== undefined
                      ? formatCurrency(loan.remaining_debt, currency)
                      : '—'}
                  </TableCell>
                  <TableCell>{currency}</TableCell>
                  <TableCell>{formatDate(loan.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[loan.status] ?? 'secondary'}>
                      {STATUS_LABELS[loan.status] ?? loan.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {loans.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  Nema kredita.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript + tests**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminLoansPage.tsx
git commit -m "feat: migrate AdminLoansPage to FilterBar"
```

---

## Task 8: Migrate AdminLoanRequestsPage

**Files:**
- Modify: `src/pages/AdminLoanRequestsPage.tsx`

- [ ] **Step 1: Replace `AdminLoanRequestsPage.tsx`**

Replace filter state and inline filter JSX with `FilterBar`. Keep table and approve/reject logic unchanged:

```tsx
import { useState } from 'react'
import { useLoanRequests, useApproveLoanRequest, useRejectLoanRequest } from '@/hooks/useLoans'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilterBar } from '@/components/ui/FilterBar'
import { LoanRequestCard } from '@/components/loans/LoanRequestCard'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { LoanRequestFilters, LoanType, LoanRequestStatus } from '@/types/loan'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const LOAN_REQUEST_FILTER_FIELDS: FilterFieldDef[] = [
  {
    key: 'loan_type',
    label: 'Tip kredita',
    type: 'multiselect',
    options: LOAN_TYPES.map((t) => ({ label: t.label, value: t.value })),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Na čekanju', value: 'PENDING' },
      { label: 'Odobren', value: 'APPROVED' },
      { label: 'Odbijen', value: 'REJECTED' },
    ],
  },
  { key: 'account_number', label: 'Broj računa', type: 'text' },
]

export function AdminLoanRequestsPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const apiFilters: LoanRequestFilters = {
    loan_type: (filterValues.loan_type as string[])?.[0] as LoanType | undefined,
    status: (filterValues.status as string[])?.[0] as LoanRequestStatus | undefined,
    account_number: (filterValues.account_number as string) || undefined,
    page: 1,
    page_size: 50,
  }
  const { data, isLoading } = useLoanRequests(apiFilters)
  const approve = useApproveLoanRequest()
  const reject = useRejectLoanRequest()
  const requests = data?.requests ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Zahtevi za kredite</h1>

      <FilterBar
        fields={LOAN_REQUEST_FILTER_FIELDS}
        values={filterValues}
        onChange={setFilterValues}
      />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tip</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Broj računa</TableHead>
              <TableHead>Tip kamate</TableHead>
              <TableHead>Valuta</TableHead>
              <TableHead>Svrha</TableHead>
              <TableHead>Mesečna plata</TableHead>
              <TableHead>Status zaposlenja</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <LoanRequestCard
                key={req.id}
                request={req}
                onApprove={(id) => approve.mutate(id)}
                onReject={(id) => reject.mutate(id)}
                approving={approve.isPending}
                rejecting={reject.isPending}
              />
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground">
                  Nema zahteva.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript + tests**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminLoanRequestsPage.tsx
git commit -m "feat: migrate AdminLoanRequestsPage to FilterBar"
```

---

## Task 9: Migrate PaymentHistoryPage

**Files:**
- Modify: `src/pages/PaymentHistoryPage.tsx`

- [ ] **Step 1: Replace `PaymentHistoryPage.tsx`**

```tsx
import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useClientAccounts } from '@/hooks/useAccounts'
import { FilterBar } from '@/components/ui/FilterBar'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'
import type { FilterFieldDef, FilterValues } from '@/types/filters'

const PAYMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'date_from', label: 'Od datuma', type: 'date' },
  { key: 'date_to', label: 'Do datuma', type: 'date' },
  {
    key: 'status_filter',
    label: 'Status',
    type: 'multiselect',
    options: [
      { label: 'Realizovano', value: 'COMPLETED' },
      { label: 'Odbijeno', value: 'FAILED' },
      { label: 'U obradi', value: 'PENDING' },
    ],
  },
  { key: 'amount_min', label: 'Min iznos', type: 'number' },
  { key: 'amount_max', label: 'Max iznos', type: 'number' },
]

export function PaymentHistoryPage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  const apiFilters: PaymentFiltersType = {
    date_from: (filterValues.date_from as string) || undefined,
    date_to: (filterValues.date_to as string) || undefined,
    status_filter: (filterValues.status_filter as string[])?.[0] || undefined,
    amount_min: filterValues.amount_min ? Number(filterValues.amount_min) : undefined,
    amount_max: filterValues.amount_max ? Number(filterValues.amount_max) : undefined,
  }

  const effectiveAccount = selectedAccountNumber || accounts[0]?.account_number
  const { data, isLoading } = usePayments(effectiveAccount, apiFilters)
  const payments = data?.payments ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija plaćanja</h1>
      {accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Račun:</Label>
          <Select
            value={selectedAccountNumber}
            onValueChange={(v) => setSelectedAccountNumber(v ?? '')}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Svi računi" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.account_number} value={acc.account_number}>
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <FilterBar
        fields={PAYMENT_FILTER_FIELDS}
        values={filterValues}
        onChange={setFilterValues}
      />
      {isLoading ? <p>Učitavanje...</p> : <PaymentHistoryTable payments={payments} />}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript + tests**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PaymentHistoryPage.tsx
git commit -m "feat: migrate PaymentHistoryPage to FilterBar"
```

---

## Task 10: Delete old filter components and their tests

**Files to delete:**
- `src/components/employees/EmployeeFilters.tsx`
- `src/components/employees/EmployeeFilters.test.tsx`
- `src/components/admin/AccountFilters.tsx`
- `src/components/admin/AccountFilters.test.tsx`
- `src/components/admin/ClientFilters.tsx`
- `src/components/admin/ClientFilters.test.tsx`
- `src/components/loans/LoanFilters.tsx`
- `src/components/loans/LoanFilters.test.tsx`
- `src/components/payments/PaymentFilters.tsx`
- `src/components/payments/PaymentFilters.test.tsx`

- [ ] **Step 1: Delete all old filter components and their tests**

```bash
rm src/components/employees/EmployeeFilters.tsx \
   src/components/employees/EmployeeFilters.test.tsx \
   src/components/admin/AccountFilters.tsx \
   src/components/admin/AccountFilters.test.tsx \
   src/components/admin/ClientFilters.tsx \
   src/components/admin/ClientFilters.test.tsx \
   src/components/loans/LoanFilters.tsx \
   src/components/loans/LoanFilters.test.tsx \
   src/components/payments/PaymentFilters.tsx \
   src/components/payments/PaymentFilters.test.tsx
```

- [ ] **Step 2: TypeScript + full test suite**

```bash
npx tsc --noEmit && npm test --no-coverage
```

Expected: zero errors, all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: delete old page-specific filter components"
```

---

## Task 11: Quality gates

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Expected: zero errors.

- [ ] **Step 2: TypeScript**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Format check**

```bash
npx prettier --check "src/**/*.{ts,tsx}"
```

If violations: run `npx prettier --write "src/**/*.{ts,tsx}"` then re-check.

- [ ] **Step 4: Coverage**

```bash
npm test -- --coverage --coverageReporters=text
```

Expected: `FilterBar` and `MultiselectDropdown` are covered. Note the coverage output for the spec update.

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: success, no errors.

- [ ] **Step 6: Commit formatting fixes (if any)**

```bash
git add -A
git commit -m "style: apply prettier formatting after FilterBar migration"
```
