import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { EmployeeFilters as Filters } from '@/types/employee'

interface EmployeeFiltersProps {
  onFilter: (filters: Filters) => void
}

export function EmployeeFilters({ onFilter }: EmployeeFiltersProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')

  const handleSearch = () => {
    onFilter({
      ...(email && { email }),
      ...(name && { name }),
      ...(position && { position }),
    })
  }

  return (
    <div className="flex gap-2 mb-4">
      <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        placeholder="Position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}
