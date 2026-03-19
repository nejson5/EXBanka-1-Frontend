import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { LoanInstallment } from '@/types/loan'

interface InstallmentTableProps {
  installments: LoanInstallment[]
}

const INSTALLMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Plaćena',
  UNPAID: 'Neplaćena',
  OVERDUE: 'Zakasnela',
}

const INSTALLMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PAID: 'default',
  UNPAID: 'secondary',
  OVERDUE: 'destructive',
}

export function InstallmentTable({ installments }: InstallmentTableProps) {
  if (installments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nema rata za prikaz.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Rok plaćanja</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell>{inst.installment_number}</TableCell>
                <TableCell>{formatDate(inst.due_date)}</TableCell>
                <TableCell>{formatCurrency(inst.amount, 'RSD')}</TableCell>
                <TableCell>
                  <Badge variant={INSTALLMENT_VARIANT[inst.status] ?? 'secondary'}>
                    {INSTALLMENT_STATUS_LABELS[inst.status] ?? inst.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
