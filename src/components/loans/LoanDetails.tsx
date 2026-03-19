import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { Loan } from '@/types/loan'

interface LoanDetailsProps {
  loan: Loan
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

export function LoanDetails({ loan }: LoanDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalji kredita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Broj kredita" value={loan.loan_number} />
        <InfoRow label="Tip kredita" value={loanTypeLabel(loan.loan_type)} />
        <InfoRow label="Iznos" value={formatCurrency(loan.amount, 'RSD')} />
        <InfoRow label="Kamatna stopa" value={`${loan.interest_rate}%`} />
        <InfoRow label="Period" value={`${loan.period} meseci`} />
        <InfoRow label="Mesečna rata" value={formatCurrency(loan.installment_amount, 'RSD')} />
        <InfoRow label="Odobren" value={formatDate(loan.created_at)} />
      </CardContent>
    </Card>
  )
}
