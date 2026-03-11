import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 border-r bg-muted/20 flex flex-col p-4">
      <div className="text-lg font-semibold mb-6">EXBanka</div>
      <nav className="flex-1 space-y-1">
        <Link to="/employees" className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
          Employees
        </Link>
      </nav>
      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </aside>
  )
}
