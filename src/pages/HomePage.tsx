import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClientAccounts } from '@/hooks/useAccounts'
import { AccountCard } from '@/components/accounts/AccountCard'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { QuickPayment } from '@/components/home/QuickPayment'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dobrodošli, {user?.email}!</h1>
        <p className="text-muted-foreground">Pregled vaših računa</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Brze akcije</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickPayment />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Menjačnica</CardTitle>
          </CardHeader>
          <CardContent>
            <ExchangeCalculator />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Moji računi</h2>
        {isLoading && <p>Učitavanje...</p>}
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={() => navigate(`/accounts/${account.id}`)}
          />
        ))}
        {!isLoading && accounts.length === 0 && (
          <p className="text-muted-foreground">Nemate aktivnih računa.</p>
        )}
      </div>
    </div>
  )
}
