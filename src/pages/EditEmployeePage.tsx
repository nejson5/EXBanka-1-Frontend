import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { useEmployee } from '@/hooks/useEmployee'
import { updateEmployee } from '@/lib/api/employees'
import type { UpdateEmployeeRequest } from '@/types/employee'

export function EditEmployeePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const employeeId = Number(id)
  const { data: employee, isLoading } = useEmployee(employeeId)

  const mutation = useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
      navigate('/employees')
    },
  })

  if (isLoading) return <p>Loading...</p>
  if (!employee) return <p>Employee not found.</p>

  if (employee.role === 'EmployeeAdmin') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Employee Details</h1>
        <p className="text-muted-foreground">Cannot edit administrators.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      <EmployeeForm
        employee={employee}
        onSubmit={(data) => mutation.mutate(data as UpdateEmployeeRequest)}
        isLoading={mutation.isPending}
      />
      {mutation.isError && <p className="text-destructive mt-2">Failed to update employee.</p>}
    </div>
  )
}
