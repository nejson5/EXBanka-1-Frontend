import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { CompanyForm } from '@/components/accounts/CompanyForm'
import { useCreateAccount } from '@/hooks/useAccounts'
import { createAccountSchema } from '@/lib/utils/validation'
import {
  CURRENT_PERSONAL_SUBTYPES,
  CURRENT_BUSINESS_SUBTYPES,
  FOREIGN_CURRENCIES,
} from '@/lib/constants/banking'
import type { Client } from '@/types/client'
import type { CreateAccountRequest } from '@/types/account'

interface CreateAccountFormProps {
  onSuccess: () => void
}

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const createAccount = useCreateAccount()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      owner_id: 0,
      account_type: 'CURRENT' as const,
      owner_type: 'PERSONAL' as const,
      subtype: 'STANDARD',
      currency: 'RSD',
      initial_balance: 0,
      create_card: false,
    },
  })

  const accountType = watch('account_type')
  const ownerType = watch('owner_type')
  const subtypes = ownerType === 'BUSINESS' ? CURRENT_BUSINESS_SUBTYPES : CURRENT_PERSONAL_SUBTYPES

  const handleClientSelected = (client: Client) => {
    setSelectedClient(client)
    setValue('owner_id', client?.id ?? 0)
  }

  const onSubmit = (data: CreateAccountRequest) => {
    createAccount.mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Account Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account_type">Account Type</Label>
          <Select
            value={accountType}
            onValueChange={(v) => {
              setValue('account_type', (v ?? 'CURRENT') as 'CURRENT' | 'FOREIGN_CURRENCY')
              setValue('currency', v === 'CURRENT' ? 'RSD' : 'EUR')
            }}
          >
            <SelectTrigger id="account_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CURRENT">Tekući (Current)</SelectItem>
              <SelectItem value="FOREIGN_CURRENCY">Devizni (Foreign Currency)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="owner_type">Owner Type</Label>
          <Select
            value={ownerType}
            onValueChange={(v) =>
              setValue('owner_type', (v ?? 'PERSONAL') as 'PERSONAL' | 'BUSINESS')
            }
          >
            <SelectTrigger id="owner_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSONAL">Lični (Personal)</SelectItem>
              <SelectItem value="BUSINESS">Poslovni (Business)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subtype">Subtype</Label>
        <Select value={watch('subtype')} onValueChange={(v) => setValue('subtype', v ?? '')}>
          <SelectTrigger id="subtype">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subtypes.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {accountType === 'FOREIGN_CURRENCY' && (
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v ?? '')}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOREIGN_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Owner (Client)</Label>
        <ClientSelector
          onClientSelected={handleClientSelected}
          selectedClient={selectedClient}
          onCreateNew={() => window.open('/admin/clients/new', '_blank')}
        />
        {errors.owner_id && (
          <p className="text-sm text-destructive mt-1">{errors.owner_id.message}</p>
        )}
      </div>

      {ownerType === 'BUSINESS' && <CompanyForm register={register} errors={errors} />}

      <div>
        <Label htmlFor="initial_balance">Initial Balance</Label>
        <Input
          id="initial_balance"
          type="number"
          {...register('initial_balance', { valueAsNumber: true })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="create_card" {...register('create_card')} />
        <Label htmlFor="create_card">Create Card</Label>
      </div>

      <Button type="submit" disabled={createAccount.isPending}>
        {createAccount.isPending ? 'Creating...' : 'Create Account'}
      </Button>

      {createAccount.isError && (
        <p className="text-sm text-destructive">Failed to create account. Please try again.</p>
      )}
    </form>
  )
}
