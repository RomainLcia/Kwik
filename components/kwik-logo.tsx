import Link from 'next/link'

// Logo Kwik : carré noir + nom. `href` à null pour un logo non cliquable.
export function KwikLogo({ href = '/', size = 'md' }: { href?: string | null; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'w-6 h-6 text-[13px]' : 'w-7 h-7 text-[15px]'
  const text = size === 'sm' ? 'text-[15px]' : 'text-lg'
  const content = (
    <span className="inline-flex items-center gap-2">
      <span className={`${box} bg-brand-gradient rounded-[5px] inline-flex items-center justify-center font-display font-bold text-white leading-none`}>K</span>
      <span className={`font-display ${text} font-bold text-gray-900`}>Kwik</span>
    </span>
  )
  if (href === null) return content
  return <Link href={href} aria-label="Kwik, accueil">{content}</Link>
}
