import { Input } from '@/components/ui/input'

interface AccountFiltersProps {
  ownerName: string
  onOwnerNameChange: (value: string) => void
  accountNumber: string
  onAccountNumberChange: (value: string) => void
}

export function AccountFilters({
  ownerName,
  onOwnerNameChange,
  accountNumber,
  onAccountNumberChange,
}: AccountFiltersProps) {
  return (
    <div className="flex gap-3">
      <Input
        placeholder="Ime vlasnika..."
        value={ownerName}
        onChange={(e) => onOwnerNameChange(e.target.value)}
      />
      <Input
        placeholder="Broj računa..."
        value={accountNumber}
        onChange={(e) => onAccountNumberChange(e.target.value)}
      />
    </div>
  )
}
