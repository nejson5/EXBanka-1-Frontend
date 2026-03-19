import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { buttonVariants } from '@/components/ui/button'
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
      <PopoverTrigger className={buttonVariants({ variant: 'outline' })}>
        {triggerLabel}
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
