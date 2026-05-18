import { CheckCircle2, Leaf, Truck, Users2 } from 'lucide-react'
import { ABOUT_IMAGE_PRIMARY, ABOUT_IMAGE_SECONDARY } from '../../utils/serviceImages'

const POINTS = [
  {
    icon: Users2,
    title: 'A consistent service team',
    text: 'The same uniformed crew visits week after week. They get to know your yard, your gate code, and your preferences.',
  },
  {
    icon: Truck,
    title: 'The right equipment, on time',
    text: 'Commercial-grade mowers, edgers, and trimmers maintained weekly. Crisp lines, clean edges, no surprises.',
  },
  {
    icon: Leaf,
    title: 'Care that builds curb appeal',
    text: 'Healthy lawns happen with attention to mowing height, edging detail, and seasonal timing—not shortcuts.',
  },
]

const CHECKLIST = [
  'Licensed & insured',
  'Transparent, flat-rate pricing',
  'Easy online booking & reschedule',
  'Satisfaction-guaranteed visits',
]

export default function About() {
  return (
    <section id="about" className="section bg-gradient-to-b from-cream-50 to-sage-50 relative overflow-hidden">
      <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-sage-200/40 blur-3xl -z-0" />
      <div className="container-px mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">
        <div className="lg:col-span-6 relative">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 relative">
              <div className="aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-card border border-white">
                <img
                  src={ABOUT_IMAGE_PRIMARY}
                  alt="Lawn care professional mowing a healthy green lawn"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lift p-4 border border-white">
                <div className="text-xs uppercase tracking-wider text-ink-500">Avg. visit</div>
                <div className="font-display text-2xl font-semibold text-forest-900">45 min</div>
              </div>
            </div>
            <div className="col-span-4 flex flex-col gap-4 pt-10">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-card border border-white">
                <img
                  src={ABOUT_IMAGE_SECONDARY}
                  alt="Edging detail along a clean walkway"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl bg-forest-900 text-cream-50 p-4 shadow-card">
                <div className="text-xs uppercase tracking-wider text-cream-50/70">Booked this week</div>
                <div className="font-display text-2xl font-semibold mt-1">137 yards</div>
                <div className="mt-3 text-xs text-cream-50/80 leading-relaxed">
                  Same-week scheduling across our service area.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <span className="eyebrow">
            <Leaf className="w-3.5 h-3.5" /> Why homeowners choose us
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold text-forest-900 tracking-tight">
            Careful, dependable lawn care—built around your week.
          </h2>
          <p className="mt-4 text-ink-700 text-base md:text-lg leading-relaxed">
            We're a local lawn care service team focused on the small details that add up to real
            curb appeal: tidy edges, the right mowing height, healthy turf, and a yard that's ready
            when you come home.
          </p>

          <div className="mt-8 space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-forest-50 text-forest-700 grid place-items-center border border-forest-100">
                  <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-forest-900">{title}</h4>
                  <p className="text-sm text-ink-600 mt-1 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {CHECKLIST.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 rounded-xl bg-white border border-ink-100 px-4 py-3 shadow-soft"
              >
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                <span className="text-sm font-medium text-ink-800">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
