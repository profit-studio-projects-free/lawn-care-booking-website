export type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type Appointment = {
  id: string
  full_name: string
  email: string
  phone: string
  service_id: string
  appointment_date: string // yyyy-MM-dd
  start_time: string // HH:mm:ss
  end_time: string // HH:mm:ss
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

export type BusinessHour = {
  id: string
  weekday: number // 0 = Sunday ... 6 = Saturday
  is_open: boolean
  start_time: string // HH:mm:ss
  end_time: string // HH:mm:ss
}

export type BlockedDate = {
  id: string
  blocked_date: string // yyyy-MM-dd
  reason: string | null
  created_at: string
}

export type BusinessSettings = {
  id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  slot_interval_minutes: number
  booking_notice_hours: number
  created_at: string
}

export type AdminUser = {
  id: string
  user_id: string
  created_at: string
}
