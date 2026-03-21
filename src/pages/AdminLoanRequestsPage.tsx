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
