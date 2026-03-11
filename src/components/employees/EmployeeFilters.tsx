import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import type { EmployeeFilters as Filters } from '@/types/employee'

interface EmployeeFiltersProps {
  onFilter: (filters: Filters) => void
}

export function EmployeeFilters({ onFilter }: EmployeeFiltersProps) {
  const [search, setSearch] = useState('')

  const applyFilter = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) {
        onFilter({})
        return
      }
      if (trimmed.includes('@')) {
        onFilter({ email: trimmed })
      } else {
        onFilter({ name: trimmed })
      }
    },
    [onFilter]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilter(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, applyFilter])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <div className="mb-4">
      <Input
        placeholder="Search by name, email or position..."
        value={search}
        onChange={handleChange}
        className="max-w-sm"
      />
    </div>
  )
}
