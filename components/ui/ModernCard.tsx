import React from 'react'
import Image from 'next/image'

type Alignment = 'center' | 'left'

export interface ModernCardProps {
  title: string
  subtitle?: string
  imageSrc?: string
  imageAlt?: string
  badges?: string[]
  align?: Alignment
  className?: string
  toneFrom?: string
  toneTo?: string
  ringColors?: { c1: string; c2: string } | null
  onClick?: () => void
}

/**
 * ModernCard: reusable, accessible card with offwhite base, frosted overlays,
 * smooth elevation/hover states, and optional gradient ring wrapper.
 */
const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  badges = [],
  align = 'center',
  className = '',
  toneFrom,
  toneTo,
  ringColors = null,
  onClick
}) => {
  const contentAlignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  const card = (
    <div
      className={`relative w-full rounded-lg glass-card morph-tilt transition-transform duration-300 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f2f2] ${className}`}
      tabIndex={0}
      onClick={onClick}
    >
      {/* Optional duotone overlay (very subtle to keep offwhite dominant) */}
      {(toneFrom && toneTo) && (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${toneFrom}, ${toneTo})`
          }}
        />
      )}
      {/* Shine and texture overlays (neutral) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.18) 22%, rgba(255,255,255,0) 40%)',
          mixBlendMode: 'overlay'
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-soft-light"
        style={{
          backgroundImage: 'url(/noise.jpg)',
          backgroundSize: '420px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Liquid morph overlay for frosted look */}
      <div className="liquid-overlay"></div>

      {/* Content */}
      <div className={`relative z-10 p-6 sm:p-6 md:p-7 lg:p-8 flex flex-col gap-4 ${contentAlignment}`}>
        {/* Header */}
        {(imageSrc || title) && (
          <div className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'} items-center gap-3`}>
            {imageSrc && (
              <div className="w-12 h-12 rounded-md flex items-center justify-center shadow-sm border border-black/10 bg-white/60 backdrop-blur-sm">
                <Image src={imageSrc} alt={imageAlt || title} width={28} height={28} className="w-7 h-7" />
              </div>
            )}
            <div className="flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{title}</h3>
              {subtitle && (<p className="text-sm sm:text-base text-gray-600">{subtitle}</p>)}
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className={`flex flex-wrap ${align === 'center' ? 'justify-center' : 'justify-start'} gap-2 pt-2`}>
            {badges.slice(0, 6).map((b) => (
              <span
                key={b}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 bg-black/[0.06] border border-black/[0.08] hover:bg-black/[0.09] transition-colors backdrop-blur-sm whitespace-nowrap"
              >
                {b}
              </span>
            ))}
            {badges.length > 6 && (
              <span className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 bg-black/[0.04] border border-black/[0.08]">
                +{badges.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover elevation micro-interaction */}
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(1200px circle at 20% 10%, rgba(0,0,0,0.05), transparent 45%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)'
        }}
      />
    </div>
  )

  if (ringColors) {
    return (
      <div className="relative rounded-xl p-[2px] glow-ring group" style={{ ['--c1' as any]: ringColors.c1, ['--c2' as any]: ringColors.c2 }}>
        {card}
      </div>
    )
  }

  return card
}

export default ModernCard