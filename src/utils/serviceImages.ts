/**
 * Map service names to high-quality lawn care imagery.
 * Image URLs are kept here so they're trivially replaceable.
 */
const IMG = {
  mowing:
    'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=1400&q=80',
  maintenance:
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80',
  hedge:
    'https://images.unsplash.com/photo-1599629954294-14df9ec8bc12?auto=format&fit=crop&w=1400&q=80',
  cleanup:
    'https://images.unsplash.com/photo-1508349937151-22b68b72d5b1?auto=format&fit=crop&w=1400&q=80',
  fertilization:
    'https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&w=1400&q=80',
  consultation:
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1400&q=80',
  generic:
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1400&q=80',
}

export function getServiceImage(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('mow')) return IMG.mowing
  if (n.includes('hedge') || n.includes('shrub') || n.includes('trim')) return IMG.hedge
  if (n.includes('cleanup') || n.includes('clean-up') || n.includes('season')) return IMG.cleanup
  if (n.includes('fertil') || n.includes('treat') || n.includes('feed')) return IMG.fertilization
  if (n.includes('consult') || n.includes('plan') || n.includes('design')) return IMG.consultation
  if (n.includes('maint') || n.includes('care') || n.includes('weekly') || n.includes('visit'))
    return IMG.maintenance
  return IMG.generic
}

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=2000&q=80'

export const ABOUT_IMAGE_PRIMARY =
  'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=1400&q=80'

export const ABOUT_IMAGE_SECONDARY =
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=80'

export const BOOKING_AMBIENT =
  'https://images.unsplash.com/photo-1572177812156-58036aae439c?auto=format&fit=crop&w=1400&q=80'
