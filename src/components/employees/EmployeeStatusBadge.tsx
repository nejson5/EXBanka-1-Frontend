import { Badge } from '@/components/ui/badge'

interface EmployeeStatusBadgeProps {
  active: boolean
}

export function EmployeeStatusBadge({ active }: EmployeeStatusBadgeProps) {
  return <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Active' : 'Inactive'}</Badge>
}
