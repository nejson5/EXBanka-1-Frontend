import type { Card, CardStatus } from '@/types/card'
import { maskCardNumber } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as CardUI, CardContent } from '@/components/ui/card'

const STATUS_LABELS: Record<CardStatus, string> = {
  ACTIVE: 'Aktivna',
  BLOCKED: 'Blokirana',
  DEACTIVATED: 'Deaktivirana',
}

const STATUS_VARIANT: Record<CardStatus, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  BLOCKED: 'secondary',
  DEACTIVATED: 'destructive',
}

interface AdminCardItemProps {
  card: Card
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  onDeactivate: (id: number) => void
}

export function AdminCardItem({ card, onBlock, onUnblock, onDeactivate }: AdminCardItemProps) {
  return (
    <CardUI>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-mono text-lg">{maskCardNumber(card.card_number)}</p>
          <p className="text-sm text-muted-foreground">{card.owner_name}</p>
          <p className="text-sm">
            {card.card_name} • {card.brand}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[card.status] ?? 'secondary'}>
            {STATUS_LABELS[card.status] ?? card.status}
          </Badge>
          {card.status === 'ACTIVE' && (
            <Button size="sm" variant="destructive" onClick={() => onBlock(card.id)}>
              Blokiraj
            </Button>
          )}
          {card.status === 'BLOCKED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onUnblock(card.id)}>
                Odblokiraj
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDeactivate(card.id)}>
                Deaktiviraj
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </CardUI>
  )
}
