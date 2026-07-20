import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface LinkCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  accentColor: string
  external?: boolean
}

export function LinkCard({ icon: Icon, title, description, href, accentColor, external }: LinkCardProps) {
  const content = (
    <div
      className="flex items-center gap-4 w-full rounded-[28px] p-4 pr-5 transition-transform active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, #f4ead9 0%, #d7b98c 55%, #c9a876 100%)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)` }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3
          className="text-sm font-bold tracking-wide uppercase"
          style={{ color: '#3a2f22', fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h3>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: '#6b5c48' }}>
          {description}
        </p>
      </div>
      <div
        className="w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className="block w-full">
      {content}
    </Link>
  )
}
