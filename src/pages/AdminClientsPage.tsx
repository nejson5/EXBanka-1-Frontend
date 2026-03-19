import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { data, isLoading } = useAllClients({ name: name || undefined, email: email || undefined })
  const clients = data?.clients ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
        <Button onClick={() => navigate('/admin/clients/new')}>Novi klijent</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Ime klijenta..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input placeholder="Email..." value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime</TableHead>
              <TableHead>Prezime</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.first_name}</TableCell>
                <TableCell>{client.last_name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone ?? '—'}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                  >
                    Izmeni
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nema klijenata.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
