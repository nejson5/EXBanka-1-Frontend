import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateEmployeeSchema } from '@/lib/utils/validation'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee'

const ROLES = ['EmployeeBasic', 'EmployeeAgent', 'EmployeeSupervisor', 'EmployeeAdmin'] as const

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => void
  isLoading: boolean
  employee?: Employee
}

// Create form schema — override date_of_birth to accept string from date input
const createFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['EmployeeBasic', 'EmployeeAgent', 'EmployeeSupervisor', 'EmployeeAdmin'], {
    message: 'Role is required',
  }),
  active: z.boolean().optional(),
})

type CreateFormData = z.infer<typeof createFormSchema>
type EditFormData = z.infer<typeof updateEmployeeSchema>

function EditForm({
  employee,
  onSubmit,
  isLoading,
}: {
  employee: Employee
  onSubmit: (data: UpdateEmployeeRequest) => void
  isLoading: boolean
}) {
  const timestampToDate = (ts: number) => {
    const d = new Date(ts * 1000)
    return d.toISOString().split('T')[0]
  }

  const { register, handleSubmit, setValue, watch } = useForm<EditFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      last_name: employee.last_name,
      gender: employee.gender,
      phone: employee.phone,
      address: employee.address,
      position: employee.position,
      department: employee.department,
      role: employee.role as (typeof ROLES)[number],
      active: employee.active,
    },
  })

  const role = watch('role')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" defaultValue={employee.first_name} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" {...register('last_name')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input
          id="date_of_birth"
          type="date"
          defaultValue={timestampToDate(employee.date_of_birth)}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={employee.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue={employee.username} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register('position')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(val) => setValue('role', val as (typeof ROLES)[number])}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}

function CreateForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: CreateEmployeeRequest) => void
  isLoading: boolean
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { active: true },
  })

  const role = watch('role')

  const handleCreateSubmit = (data: CreateFormData) => {
    const timestamp = data.date_of_birth
      ? Math.floor(new Date(data.date_of_birth).getTime() / 1000)
      : 0
    onSubmit({ ...data, date_of_birth: timestamp })
  }

  return (
    <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" {...register('first_name')} />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" {...register('last_name')} />
        {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Input id="gender" {...register('gender')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register('position')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register('department')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(val) => setValue('role', val as (typeof ROLES)[number])}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}

export function EmployeeForm({ onSubmit, isLoading, employee }: EmployeeFormProps) {
  if (employee) {
    return (
      <EditForm employee={employee} onSubmit={(data) => onSubmit(data)} isLoading={isLoading} />
    )
  }

  return <CreateForm onSubmit={(data) => onSubmit(data)} isLoading={isLoading} />
}
