export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
}

export type Appointment = {
  id: string
  full_name: string
  email: string
  phone: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

export type BusinessHour = {
  id: string
  weekday: number
  is_open: boolean
  start_time: string
  end_time: string
}

export type BlockedDate = {
  id: string
  blocked_date: string
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

export type Database = {
  public: {
    Tables: {
      services: {
        Row: Service
        Insert: Partial<Service> & { name: string; duration_minutes: number; price: number }
        Update: Partial<Service>
        Relationships: []
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'status'> & { status?: AppointmentStatus }
        Update: Partial<Appointment>
        Relationships: [
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      business_hours: {
        Row: BusinessHour
        Insert: Partial<BusinessHour>
        Update: Partial<BusinessHour>
        Relationships: []
      }
      blocked_dates: {
        Row: BlockedDate
        Insert: Partial<BlockedDate> & { blocked_date: string }
        Update: Partial<BlockedDate>
        Relationships: []
      }
      business_settings: {
        Row: BusinessSettings
        Insert: Partial<BusinessSettings>
        Update: Partial<BusinessSettings>
        Relationships: []
      }
      admin_users: {
        Row: AdminUser
        Insert: Partial<AdminUser> & { user_id: string }
        Update: Partial<AdminUser>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_booked_intervals: {
        Args: { p_date: string }
        Returns: { start_time: string; end_time: string }[]
      }
    }
  }
}
