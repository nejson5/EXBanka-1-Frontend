import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'
import { resetPassword } from '@/lib/api/auth'
import type { PasswordResetPayload } from '@/types/auth'

export function PasswordResetPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const mutation = useMutation({
    mutationFn: (data: { new_password: string; confirm_password: string }) =>
      resetPassword({ token, ...data } as PasswordResetPayload),
  })

  return (
    <PasswordResetForm
      onSubmit={(data) => mutation.mutate(data)}
      isLoading={mutation.isPending}
      isSuccess={mutation.isSuccess}
      error={mutation.isError ? 'Failed to reset password. The link may have expired.' : undefined}
    />
  )
}
