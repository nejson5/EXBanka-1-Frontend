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
      <FilterBar fields={ACCOUNT_FILTER_FIELDS} values={filterValues} onChange={setFilterValues} />
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
