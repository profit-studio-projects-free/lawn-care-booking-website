/**
 * Safe in-memory demo data used ONLY when Supabase env vars are missing.
 * The real backend is never replaced when env vars are present.
 */
const NOW = new Date().toISOString()

export const DEMO_BUSINESS_SETTINGS = {
  id: 'demo-settings',
  business_name: 'Verdant Lawn Care',
  business_email: 'hello@verdantlawn.co',
  business_phone: '(555) 014-2090',
  business_address: '120 Greenfield Lane, Suite 4 · Cedar Hills',
  slot_interval_minutes: 30,
  booking_notice_hours: 4,
  created_at: NOW,
}

export const DEMO_SERVICES = [
  {
    id: 'demo-mow',
    name: 'Weekly Lawn Mowing',
    description:
      'Clean, even mowing with crisp edging along walkways and driveways. Clippings cleaned up before we leave.',
    duration_minutes: 45,
    price: 65,
    is_active: true,
    created_at: NOW,
  },
  {
    id: 'demo-maintenance',
    name: 'Full Lawn Maintenance Visit',
    description:
      'Mow, edge, line-trim, and blow-clean—everything a healthy yard needs in a single visit.',
    duration_minutes: 75,
    price: 110,
    is_active: true,
    created_at: NOW,
  },
  {
    id: 'demo-hedge',
    name: 'Hedge & Shrub Trimming',
    description:
      'Shape and trim hedges and shrubs to keep your yard looking sharp and well-cared-for.',
    duration_minutes: 90,
    price: 135,
    is_active: true,
    created_at: NOW,
  },
  {
    id: 'demo-cleanup',
    name: 'Seasonal Yard Cleanup',
    description:
      'Leaf removal, debris cleanup, and a thorough refresh to get the yard season-ready.',
    duration_minutes: 120,
    price: 180,
    is_active: true,
    created_at: NOW,
  },
  {
    id: 'demo-fert',
    name: 'Fertilization Visit',
    description:
      'Careful, professional turf treatment timed for the season to support healthy, green growth.',
    duration_minutes: 60,
    price: 95,
    is_active: true,
    created_at: NOW,
  },
  {
    id: 'demo-consult',
    name: 'Landscape Consultation',
    description:
      'A walk-through of your yard with our team to plan the right care routine and curb appeal upgrades.',
    duration_minutes: 30,
    price: 0,
    is_active: true,
    created_at: NOW,
  },
]

export const DEMO_BUSINESS_HOURS = [
  { id: 'h-0', weekday: 0, is_open: false, start_time: '09:00:00', end_time: '15:00:00' },
  { id: 'h-1', weekday: 1, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
  { id: 'h-2', weekday: 2, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
  { id: 'h-3', weekday: 3, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
  { id: 'h-4', weekday: 4, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
  { id: 'h-5', weekday: 5, is_open: true, start_time: '08:00:00', end_time: '17:00:00' },
  { id: 'h-6', weekday: 6, is_open: true, start_time: '09:00:00', end_time: '14:00:00' },
]

export const DEMO_BLOCKED_DATES: any[] = []
export const DEMO_APPOINTMENTS: any[] = []
export const DEMO_ADMIN_USERS: any[] = []

export const DEMO_DATA: Record<string, any[]> = {
  services: DEMO_SERVICES,
  business_hours: DEMO_BUSINESS_HOURS,
  business_settings: [DEMO_BUSINESS_SETTINGS],
  blocked_dates: DEMO_BLOCKED_DATES,
  appointments: DEMO_APPOINTMENTS,
  admin_users: DEMO_ADMIN_USERS,
}
