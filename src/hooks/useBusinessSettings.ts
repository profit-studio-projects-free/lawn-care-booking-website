import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BusinessSettings } from '../types/database'

const FALLBACK: BusinessSettings = {
  id: 'fallback',
  business_name: 'Verdant Lawn Care',
  business_email: 'hello@verdantlawn.co',
  business_phone: '(555) 014-2090',
  business_address: '120 Greenfield Lane, Suite 4 · Cedar Hills',
  slot_interval_minutes: 30,
  booking_notice_hours: 4,
  created_at: new Date().toISOString(),
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setSettings(FALLBACK)
      } else {
        setSettings(data as BusinessSettings)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { settings: settings ?? FALLBACK, loading }
}
