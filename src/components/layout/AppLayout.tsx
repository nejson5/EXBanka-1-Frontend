import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
