interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{message}</div>
}
