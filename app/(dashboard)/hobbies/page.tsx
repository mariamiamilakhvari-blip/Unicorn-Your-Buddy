'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function HobbyIcon({ name }: { name: string }) {
  const cls = 'w-8 h-8'
  if (name === 'Painting') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="10" cy="10" r="3" fill="#c4a8fc" opacity="0.9"/>
      <circle cx="22" cy="10" r="3" fill="#fef08a" opacity="0.9"/>
      <circle cx="10" cy="22" r="3" fill="#86efac" opacity="0.9"/>
      <circle cx="22" cy="22" r="3" fill="#f472b6" opacity="0.9"/>
      <circle cx="16" cy="16" r="4" fill="#7a4bdf" opacity="0.85"/>
    </svg>
  )
  if (name === 'Photography') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="9" width="24" height="16" rx="3" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <circle cx="16" cy="17" r="5" fill="#fef08a" opacity="0.8"/>
      <circle cx="16" cy="17" r="3" fill="#5e2d8f" opacity="0.7"/>
      <rect x="12" y="6" width="8" height="4" rx="1.5" fill="#7a4bdf" opacity="0.7"/>
    </svg>
  )
  if (name === 'Writing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="6" y="5" width="16" height="22" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="10" y1="11" x2="18" y2="11" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="15" x2="18" y2="15" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="19" x2="15" y2="19" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 20 L27 15 L29 17 L24 22 Z" fill="#fef08a" stroke="#d4962a" strokeWidth="1"/>
    </svg>
  )
  if (name === 'Drawing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 24 L20 8 L24 12 L12 28 Z" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1.2"/>
      <path d="M20 8 L24 6 L26 10 L24 12 Z" fill="#fef08a" stroke="#d4962a" strokeWidth="1"/>
      <line x1="8" y1="24" x2="12" y2="28" stroke="#7a4bdf" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 26 L9 25 L7 28 Z" fill="#5e2d8f"/>
    </svg>
  )
  if (name === 'Music') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M14 6 L26 4 L26 12 L14 14 Z" fill="#c4a8fc" opacity="0.8"/>
      <circle cx="11" cy="22" r="4" fill="#fef08a" opacity="0.85"/>
      <circle cx="23" cy="20" r="4" fill="#7a4bdf" opacity="0.7"/>
      <line x1="14" y1="6" x2="14" y2="22" stroke="#5e2d8f" strokeWidth="1.5"/>
      <line x1="26" y1="4" x2="26" y2="20" stroke="#5e2d8f" strokeWidth="1.5"/>
    </svg>
  )
  if (name === 'Dancing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="6" r="3" fill="#f472b6" opacity="0.9"/>
      <path d="M16 9 Q20 14 18 20" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M18 14 Q24 12 25 16" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M18 14 Q12 16 10 20" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M18 20 Q22 24 20 28" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M18 20 Q14 25 16 28" stroke="#c4a8fc" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Cooking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <ellipse cx="16" cy="22" rx="11" ry="6" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <rect x="5" y="14" width="22" height="8" rx="2" fill="#c4a8fc" opacity="0.7"/>
      <rect x="13" y="8" width="6" height="7" rx="1" fill="#7a4bdf" opacity="0.6"/>
      <path d="M10 10 Q10 7 13 8" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M22 10 Q22 7 19 8" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Baking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="5" y="20" width="22" height="7" rx="2" fill="#fef08a" stroke="#d4962a" strokeWidth="1.2"/>
      <rect x="7" y="14" width="18" height="7" rx="2" fill="#c4a8fc" opacity="0.8"/>
      <rect x="9" y="9" width="14" height="6" rx="2" fill="#e2d4fe" stroke="#9f74f0" strokeWidth="1"/>
      <circle cx="12" cy="8" r="1.5" fill="#f472b6"/>
      <circle cx="16" cy="7" r="1.5" fill="#fef08a"/>
      <circle cx="20" cy="8" r="1.5" fill="#86efac"/>
    </svg>
  )
  if (name === 'Gardening') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M16 28 L16 14" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 20 Q10 16 8 10 Q14 10 16 16" fill="#86efac" opacity="0.9"/>
      <path d="M16 17 Q22 13 24 8 Q18 8 16 14" fill="#4ade80" opacity="0.8"/>
      <ellipse cx="16" cy="28" rx="6" ry="2" fill="#d4962a" opacity="0.5"/>
    </svg>
  )
  if (name === 'Hiking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polygon points="16,4 28,26 4,26" fill="#c4a8fc" opacity="0.7" stroke="#7a4bdf" strokeWidth="1.5"/>
      <polygon points="16,10 24,26 8,26" fill="#7a4bdf" opacity="0.5"/>
      <circle cx="22" cy="10" r="2.5" fill="#fef08a" opacity="0.9"/>
    </svg>
  )
  if (name === 'Yoga') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="6" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M16 9 L16 18" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 13 Q10 11 8 14" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M16 13 Q22 11 24 14" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M16 18 Q12 22 10 27" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M16 18 Q20 22 22 27" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Meditation') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="11" fill="#e2d4fe" opacity="0.5"/>
      <circle cx="16" cy="16" r="7" fill="#c4a8fc" opacity="0.6"/>
      <circle cx="16" cy="16" r="3.5" fill="#7a4bdf" opacity="0.8"/>
      <circle cx="16" cy="6" r="1.5" fill="#fef08a"/>
      <circle cx="26" cy="16" r="1.5" fill="#fef08a"/>
      <circle cx="16" cy="26" r="1.5" fill="#fef08a"/>
      <circle cx="6" cy="16" r="1.5" fill="#fef08a"/>
    </svg>
  )
  if (name === 'Running') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="20" cy="6" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M20 9 Q18 13 14 14 Q10 15 8 20" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M14 14 Q16 18 20 20 Q22 24 20 28" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M18 10 Q22 12 26 10" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Swimming') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M4 12 Q8 8 12 12 Q16 16 20 12 Q24 8 28 12" stroke="#7a4bdf" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M4 19 Q8 15 12 19 Q16 23 20 19 Q24 15 28 19" stroke="#c4a8fc" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M4 26 Q8 22 12 26 Q16 30 20 26 Q24 22 28 26" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Cycling') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="9" cy="22" r="6" fill="none" stroke="#7a4bdf" strokeWidth="2"/>
      <circle cx="23" cy="22" r="6" fill="none" stroke="#7a4bdf" strokeWidth="2"/>
      <circle cx="9" cy="22" r="2" fill="#fef08a"/>
      <circle cx="23" cy="22" r="2" fill="#fef08a"/>
      <path d="M9 22 L16 10 L23 22" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M13 10 L19 10" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Reading') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="5" y="7" width="22" height="18" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="16" y1="7" x2="16" y2="25" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="8" y1="13" x2="14" y2="13" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="14" y2="17" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="13" x2="24" y2="13" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="17" x2="24" y2="17" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 4 L16 7 L22 4" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (name === 'Coding') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="7" width="24" height="18" rx="3" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M11 14 L8 16 L11 18" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M21 14 L24 16 L21 18" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="15" y1="12" x2="17" y2="20" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Language Learning') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M5 8 Q5 5 8 5 L20 5 Q23 5 23 8 L23 17 Q23 20 20 20 L14 20 L9 25 L9 20 L8 20 Q5 20 5 17 Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M13 11 Q17 8 21 11 Q25 14 23 20 L26 24 L21 22 Q17 24 13 22" fill="#fef08a" opacity="0.7" stroke="#d4962a" strokeWidth="1"/>
      <line x1="10" y1="11" x2="18" y2="11" stroke="#9f74f0" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10" y1="15" x2="16" y2="15" stroke="#9f74f0" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Chess') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="11" y="22" width="10" height="4" rx="1" fill="#5e2d8f"/>
      <rect x="13" y="18" width="6" height="5" rx="1" fill="#7a4bdf" opacity="0.9"/>
      <path d="M12 12 Q12 9 14 8 L16 10 L18 8 Q20 9 20 12 L18 18 L14 18 Z" fill="#c4a8fc"/>
      <circle cx="16" cy="7" r="2" fill="#fef08a" opacity="0.9"/>
    </svg>
  )
  if (name === 'Knitting') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="17" r="9" fill="#c4a8fc" opacity="0.6"/>
      <path d="M16 8 Q20 12 16 17 Q12 22 16 26" stroke="#7a4bdf" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 8 Q12 12 16 17 Q20 22 16 26" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="10" y1="5" x2="12" y2="14" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="5" x2="20" y2="14" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Pottery') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M12 6 Q8 8 7 14 Q6 20 10 24 Q13 27 16 27 Q19 27 22 24 Q26 20 25 14 Q24 8 20 6 Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M12 6 Q16 4 20 6" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="27" rx="7" ry="2" fill="#c4a8fc" opacity="0.6"/>
      <path d="M10 15 Q14 13 16 15 Q18 17 22 15" stroke="#9f74f0" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Woodworking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="13" width="20" height="8" rx="2" fill="#fef08a" stroke="#d4962a" strokeWidth="1.5"/>
      <line x1="8" y1="13" x2="8" y2="21" stroke="#d4962a" strokeWidth="1" strokeLinecap="round"/>
      <line x1="12" y1="13" x2="12" y2="21" stroke="#d4962a" strokeWidth="1" strokeLinecap="round"/>
      <line x1="16" y1="13" x2="16" y2="21" stroke="#d4962a" strokeWidth="1" strokeLinecap="round"/>
      <path d="M22 13 L28 8 L28 13 L22 21 Z" fill="#7a4bdf" opacity="0.85"/>
    </svg>
  )
  if (name === 'Illustration') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="5" y="5" width="22" height="22" rx="3" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M9 23 L13 13 L17 19 L20 15 L23 23 Z" fill="#c4a8fc" stroke="#5e2d8f" strokeWidth="1"/>
      <circle cx="10" cy="10" r="2.5" fill="#fef08a" opacity="0.9"/>
    </svg>
  )
  if (name === 'Filmmaking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="9" width="20" height="14" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M24 13 L28 11 L28 21 L24 19 Z" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1"/>
      <circle cx="14" cy="16" r="4" fill="#7a4bdf" opacity="0.7"/>
      <polygon points="12,14 12,18 17,16" fill="#fef08a"/>
    </svg>
  )
  if (name === 'Sewing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M6 26 L24 8" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="24" cy="8" rx="4" ry="2.5" transform="rotate(-45 24 8)" fill="#c4a8fc" stroke="#5e2d8f" strokeWidth="1"/>
      <path d="M6 12 Q10 8 14 12 Q18 16 22 12" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="6" cy="26" r="2.5" fill="#f472b6" opacity="0.8"/>
    </svg>
  )
  if (name === 'Origami') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polygon points="16,4 28,24 4,24" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <polygon points="16,4 28,24 16,24" fill="#c4a8fc" opacity="0.6"/>
      <line x1="16" y1="4" x2="16" y2="24" stroke="#7a4bdf" strokeWidth="1" strokeLinecap="round"/>
      <line x1="10" y1="14" x2="22" y2="14" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Calligraphy') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 24 Q10 20 12 16 Q14 12 16 10" stroke="#7a4bdf" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M16 10 Q20 8 22 12 Q24 16 20 20 Q16 24 14 22" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="6" y1="27" x2="26" y2="27" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'DIY Projects') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="13" y="4" width="6" height="16" rx="2" fill="#fef08a" stroke="#d4962a" strokeWidth="1.2"/>
      <rect x="10" y="18" width="12" height="5" rx="1.5" fill="#7a4bdf" opacity="0.8"/>
      <line x1="8" y1="10" x2="13" y2="10" stroke="#5e2d8f" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="19" y1="10" x2="24" y2="10" stroke="#5e2d8f" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Candle Making') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="11" y="14" width="10" height="14" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M16 14 L16 10" stroke="#7a4bdf" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="16" cy="8" rx="2.5" ry="3.5" fill="#fef08a" opacity="0.9"/>
      <ellipse cx="16" cy="7" rx="1.5" ry="2" fill="#f472b6" opacity="0.7"/>
    </svg>
  )
  if (name === 'Home Decor') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M5 15 L16 5 L27 15 L27 27 L5 27 Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <rect x="12" y="20" width="8" height="7" rx="1" fill="#c4a8fc" opacity="0.8"/>
      <rect x="8" y="16" width="5" height="5" rx="1" fill="#fef08a" opacity="0.85"/>
      <path d="M16 5 L16 2" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Bird Watching') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <ellipse cx="11" cy="14" rx="5" ry="3.5" fill="#c4a8fc" opacity="0.8" transform="rotate(-20 11 14)"/>
      <ellipse cx="21" cy="14" rx="5" ry="3.5" fill="#c4a8fc" opacity="0.8" transform="rotate(20 21 14)"/>
      <circle cx="11" cy="14" r="2" fill="#5e2d8f" opacity="0.8"/>
      <circle cx="21" cy="14" r="2" fill="#5e2d8f" opacity="0.8"/>
      <path d="M11 16 L16 22 L21 16" stroke="#7a4bdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="20" cy="9" r="2" fill="#fef08a" opacity="0.9"/>
      <path d="M20 11 Q22 13 21 15" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Rock Climbing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polygon points="4,28 16,6 28,28" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <polygon points="16,14 24,28 8,28" fill="#c4a8fc" opacity="0.5"/>
      <circle cx="16" cy="6" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M16 9 Q18 13 17 17" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="14" y1="15" x2="11" y2="19" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="15" x2="20" y2="18" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Camping') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polygon points="16,5 28,25 4,25" fill="#c4a8fc" opacity="0.7" stroke="#7a4bdf" strokeWidth="1.5"/>
      <polygon points="16,5 22,25 10,25" fill="#e2d4fe" opacity="0.8"/>
      <line x1="4" y1="25" x2="28" y2="25" stroke="#d4962a" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="10" r="3" fill="#fef08a" opacity="0.8"/>
      <circle cx="22" cy="10" r="1.5" fill="#f472b6" opacity="0.7"/>
    </svg>
  )
  if (name === 'Fishing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <line x1="8" y1="6" x2="8" y2="22" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 6 Q20 8 22 16" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="22" cy="18" r="2" fill="#fef08a" opacity="0.9"/>
      <path d="M6 24 Q10 20 14 24 Q18 28 22 24" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <ellipse cx="22" cy="26" rx="4" ry="2" fill="#86efac" opacity="0.8" transform="rotate(-10 22 26)"/>
    </svg>
  )
  if (name === 'Stargazing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="11" fill="#1e1b4b" opacity="0.15"/>
      <polygon points="16,5 17.2,9 21,9 18,11.5 19.2,15.5 16,13 12.8,15.5 14,11.5 11,9 14.8,9" fill="#fef08a" opacity="0.9"/>
      <circle cx="8" cy="10" r="1.2" fill="#fef08a" opacity="0.7"/>
      <circle cx="25" cy="8" r="0.9" fill="#fef08a" opacity="0.6"/>
      <circle cx="24" cy="22" r="1.5" fill="#fef08a" opacity="0.8"/>
      <circle cx="7" cy="22" r="1" fill="#c4a8fc" opacity="0.8"/>
      <circle cx="20" cy="26" r="0.8" fill="#fef08a" opacity="0.5"/>
    </svg>
  )
  if (name === 'Foraging') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M16 28 C16 28 6 22 6 15 C6 10 10 7 13 8 C14.5 8.5 15.5 9.5 16 11 C16.5 9.5 17.5 8.5 19 8 C22 7 26 10 26 15 C26 22 16 28 16 28Z" fill="#86efac" opacity="0.8"/>
      <path d="M16 11 L16 28" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 17 L16 15" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M21 14 L16 16" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Journaling') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="7" y="4" width="18" height="24" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <rect x="7" y="4" width="4" height="24" rx="2" fill="#c4a8fc" opacity="0.6"/>
      <line x1="14" y1="10" x2="22" y2="10" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="14" x2="22" y2="14" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="18" x2="19" y2="18" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 21 L24 18 L26 20 L22 23 Z" fill="#fef08a" stroke="#d4962a" strokeWidth="0.8"/>
    </svg>
  )
  if (name === 'Breathwork') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M4 16 Q8 10 16 16 Q24 22 28 16" stroke="#7a4bdf" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M4 22 Q8 16 16 22 Q24 28 28 22" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M4 10 Q8 4 16 10 Q24 16 28 10" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Tai Chi') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#e2d4fe" strokeWidth="1.5"/>
      <path d="M16 6 A10 10 0 0 1 16 26 A5 5 0 0 1 16 16 A5 5 0 0 0 16 6" fill="#7a4bdf" opacity="0.7"/>
      <circle cx="16" cy="11" r="2" fill="#fef08a" opacity="0.9"/>
      <circle cx="16" cy="21" r="2" fill="#e2d4fe" opacity="0.9"/>
    </svg>
  )
  if (name === 'Sound Healing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="5" fill="#c4a8fc" opacity="0.8"/>
      <path d="M16 7 A9 9 0 0 1 25 16" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M16 25 A9 9 0 0 1 7 16" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M16 4 A12 12 0 0 1 28 16" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 28 A12 12 0 0 1 4 16" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Walking') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="6" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M16 9 Q17 13 15 17" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M15 13 Q19 12 21 15" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M15 13 Q11 14 10 17" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M15 17 Q17 21 16 26" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M15 17 Q13 21 14 26" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (name === 'Stretching') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="6" r="2.5" fill="#fef08a" opacity="0.9"/>
      <line x1="16" y1="9" x2="16" y2="18" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="14" x2="26" y2="14" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 18 L10 28" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 18 L22 28" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Weightlifting') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <line x1="8" y1="16" x2="24" y2="16" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="12" width="5" height="8" rx="2" fill="#5e2d8f" opacity="0.8"/>
      <rect x="23" y="12" width="5" height="8" rx="2" fill="#5e2d8f" opacity="0.8"/>
      <rect x="6" y="13" width="3" height="6" rx="1" fill="#c4a8fc"/>
      <rect x="23" y="13" width="3" height="6" rx="1" fill="#c4a8fc"/>
      <circle cx="16" cy="13" r="2" fill="#fef08a" opacity="0.9"/>
    </svg>
  )
  if (name === 'Boxing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 18 Q7 14 9 11 Q11 8 15 8 L20 8 Q24 8 24 13 L24 18 Q24 22 20 23 L15 24 Q10 24 8 20 Z" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M15 8 L15 5 Q15 4 16 4 Q17 4 17 5 L17 8" stroke="#5e2d8f" strokeWidth="1.2" fill="none"/>
      <line x1="8" y1="15" x2="24" y2="15" stroke="#7a4bdf" strokeWidth="1" strokeLinecap="round"/>
      <line x1="10" y1="11" x2="10" y2="19" stroke="#9f74f0" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Tennis') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="15" cy="15" r="10" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M6 10 Q11 13 11 17 Q11 21 6 20" stroke="#7a4bdf" strokeWidth="1.5" fill="none"/>
      <path d="M24 10 Q19 13 19 17 Q19 21 24 20" stroke="#7a4bdf" strokeWidth="1.5" fill="none"/>
      <circle cx="15" cy="15" r="3" fill="#fef08a" opacity="0.9"/>
      <line x1="22" y1="22" x2="27" y2="27" stroke="#5e2d8f" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Pilates') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <ellipse cx="16" cy="26" rx="12" ry="3" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.2"/>
      <circle cx="16" cy="7" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M16 10 L16 20" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 14 L22 14" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 20 L11 26" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 20 L21 26" stroke="#c4a8fc" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Martial Arts') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="7" r="2.5" fill="#fef08a" opacity="0.9"/>
      <path d="M16 10 L16 18" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 14 L22 10" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 18 L10 24" stroke="#5e2d8f" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 18 L22 24" stroke="#c4a8fc" strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="16" x2="6" y2="20" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Philosophy') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="12" r="7" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M13 10 Q14 8 16 9 Q18 10 17 12 Q16 13 16 15" stroke="#5e2d8f" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="17" r="1" fill="#5e2d8f"/>
      <rect x="10" y="22" width="12" height="3" rx="1.5" fill="#fef08a" opacity="0.9"/>
      <line x1="16" y1="19" x2="16" y2="22" stroke="#7a4bdf" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'History') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 6 Q8 4 10 4 L22 4 Q24 4 24 6 L24 26 Q24 28 22 28 L10 28 Q8 28 8 26 Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="12" y1="10" x2="20" y2="10" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="20" y2="14" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="17" y2="18" stroke="#9f74f0" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="24" r="2" fill="#fef08a" opacity="0.9"/>
    </svg>
  )
  if (name === 'Astronomy') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="8" fill="#1e1b4b" opacity="0.15"/>
      <circle cx="16" cy="16" r="4" fill="#7a4bdf" opacity="0.7"/>
      <ellipse cx="16" cy="16" rx="12" ry="4" fill="none" stroke="#c4a8fc" strokeWidth="1.5" transform="rotate(-30 16 16)"/>
      <circle cx="8" cy="8" r="1.5" fill="#fef08a" opacity="0.9"/>
      <circle cx="25" cy="9" r="1" fill="#fef08a" opacity="0.7"/>
      <circle cx="23" cy="25" r="1.2" fill="#fef08a" opacity="0.8"/>
    </svg>
  )
  if (name === 'Psychology') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 18 Q6 12 9 8 Q12 4 16 5 Q20 4 23 8 Q26 12 24 18 Q22 22 16 24 Q10 22 8 18Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <path d="M12 13 Q14 11 16 13 Q18 15 16 17 Q15 18 16 20" stroke="#5e2d8f" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="14" y1="10" x2="18" y2="10" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Investing') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polyline points="4,24 10,18 14,20 20,12 26,8" stroke="#7a4bdf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polygon points="22,6 28,6 28,12" fill="#fef08a" opacity="0.9"/>
      <line x1="4" y1="26" x2="28" y2="26" stroke="#c4a8fc" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="8" x2="4" y2="26" stroke="#c4a8fc" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Puzzles') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="5" y="5" width="10" height="10" rx="1.5" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1.2"/>
      <rect x="17" y="5" width="10" height="10" rx="1.5" fill="#fef08a" stroke="#d4962a" strokeWidth="1.2"/>
      <rect x="5" y="17" width="10" height="10" rx="1.5" fill="#86efac" stroke="#16a34a" strokeWidth="1.2"/>
      <rect x="17" y="17" width="10" height="10" rx="1.5" fill="#f472b6" stroke="#be185d" strokeWidth="1.2" opacity="0.8"/>
      <circle cx="16" cy="16" r="3" fill="white" stroke="#7a4bdf" strokeWidth="1.5"/>
    </svg>
  )
  if (name === 'Sudoku') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="12" y1="4" x2="12" y2="28" stroke="#9f74f0" strokeWidth="1"/>
      <line x1="20" y1="4" x2="20" y2="28" stroke="#9f74f0" strokeWidth="1"/>
      <line x1="4" y1="12" x2="28" y2="12" stroke="#9f74f0" strokeWidth="1"/>
      <line x1="4" y1="20" x2="28" y2="20" stroke="#9f74f0" strokeWidth="1"/>
      <circle cx="8" cy="8" r="2" fill="#fef08a" opacity="0.9"/>
      <circle cx="24" cy="24" r="2" fill="#7a4bdf" opacity="0.7"/>
      <circle cx="16" cy="16" r="2" fill="#f472b6" opacity="0.8"/>
    </svg>
  )
  if (name === 'Memory Training') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M8 18 Q6 12 9 8 Q12 4 16 5 Q20 4 23 8 Q26 12 24 18 Q22 22 16 24 Q10 22 8 18Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="1.5" fill="#fef08a"/>
      <circle cx="20" cy="13" r="1.5" fill="#fef08a"/>
      <circle cx="16" cy="17" r="1.5" fill="#fef08a"/>
      <line x1="12" y1="13" x2="20" y2="13" stroke="#5e2d8f" strokeWidth="1" strokeLinecap="round"/>
      <line x1="12" y1="13" x2="16" y2="17" stroke="#5e2d8f" strokeWidth="1" strokeLinecap="round"/>
      <line x1="20" y1="13" x2="16" y2="17" stroke="#5e2d8f" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
  if (name === 'Strategy Games') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="14" y1="4" x2="14" y2="28" stroke="#c4a8fc" strokeWidth="1"/>
      <line x1="4" y1="14" x2="28" y2="14" stroke="#c4a8fc" strokeWidth="1"/>
      <circle cx="9" cy="9" r="3" fill="#5e2d8f" opacity="0.8"/>
      <circle cx="23" cy="23" r="3" fill="#fef08a" opacity="0.9"/>
      <circle cx="9" cy="23" r="2" fill="#f472b6" opacity="0.7"/>
    </svg>
  )
  if (name === 'Crosswords') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <rect x="8" y="8" width="5" height="5" rx="0.5" fill="#7a4bdf" opacity="0.7"/>
      <rect x="15" y="8" width="5" height="5" rx="0.5" fill="#c4a8fc" opacity="0.8"/>
      <rect x="8" y="15" width="5" height="5" rx="0.5" fill="#fef08a" opacity="0.85"/>
      <rect x="19" y="15" width="5" height="9" rx="0.5" fill="#c4a8fc" opacity="0.6"/>
      <rect x="15" y="19" width="5" height="5" rx="0.5" fill="#86efac" opacity="0.8"/>
    </svg>
  )
  if (name === 'Debate') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <path d="M4 6 Q4 4 6 4 L16 4 Q18 4 18 6 L18 13 Q18 15 16 15 L12 15 L8 19 L8 15 L6 15 Q4 15 4 13 Z" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.2"/>
      <path d="M14 17 Q14 15 16 15 L22 15 Q24 15 24 17 L24 23 Q24 25 22 25 L20 25 L20 28 L17 25 L16 25 Q14 25 14 23 Z" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1.2"/>
    </svg>
  )
  if (name === 'Visualization') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <ellipse cx="16" cy="16" rx="12" ry="7" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="4" fill="#c4a8fc" opacity="0.8"/>
      <circle cx="16" cy="16" r="2" fill="#5e2d8f" opacity="0.9"/>
      <circle cx="16" cy="16" r="0.8" fill="#fef08a"/>
    </svg>
  )
  if (name === 'Embroidery') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="11" fill="none" stroke="#e2d4fe" strokeWidth="2"/>
      <circle cx="16" cy="16" r="11" fill="none" stroke="#7a4bdf" strokeWidth="1" strokeDasharray="3 3"/>
      <path d="M16 8 Q20 12 16 16 Q12 20 16 24" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M16 8 Q12 12 16 16 Q20 20 16 24" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="8" r="1.5" fill="#7a4bdf"/>
      <circle cx="16" cy="24" r="1.5" fill="#7a4bdf"/>
    </svg>
  )
  if (name === 'Jewelry Making') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <polygon points="16,5 20,12 28,12 22,18 24,26 16,21 8,26 10,18 4,12 12,12" fill="#fef08a" stroke="#d4962a" strokeWidth="1.2" opacity="0.9"/>
      <circle cx="16" cy="16" r="3.5" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1"/>
    </svg>
  )
  if (name === 'Leatherwork') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="5" y="8" width="22" height="16" rx="3" fill="#fef08a" stroke="#d4962a" strokeWidth="1.5"/>
      <line x1="5" y1="14" x2="27" y2="14" stroke="#d4962a" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="16" cy="19" r="2.5" fill="#7a4bdf" opacity="0.8"/>
      <line x1="10" y1="8" x2="10" y2="24" stroke="#d4962a" strokeWidth="0.8"/>
      <line x1="22" y1="8" x2="22" y2="24" stroke="#d4962a" strokeWidth="0.8"/>
    </svg>
  )
  if (name === 'Soap Making') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <rect x="7" y="12" width="18" height="14" rx="4" fill="#c4a8fc" stroke="#7a4bdf" strokeWidth="1.5"/>
      <ellipse cx="16" cy="12" rx="9" ry="4" fill="#e2d4fe" stroke="#7a4bdf" strokeWidth="1.2"/>
      <circle cx="12" cy="8" r="2" fill="#fef08a" opacity="0.8"/>
      <circle cx="18" cy="7" r="1.5" fill="#86efac" opacity="0.8"/>
      <circle cx="22" cy="10" r="1.2" fill="#f472b6" opacity="0.7"/>
    </svg>
  )
  if (name === 'Weaving') return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <line x1="8" y1="4" x2="8" y2="28" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="14" y1="4" x2="14" y2="28" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="20" y1="4" x2="20" y2="28" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="26" y1="4" x2="26" y2="28" stroke="#7a4bdf" strokeWidth="1.5"/>
      <line x1="4" y1="9" x2="28" y2="9" stroke="#fef08a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4" y1="15" x2="28" y2="15" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <line x1="4" y1="21" x2="28" y2="21" stroke="#86efac" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cls}>
      <circle cx="16" cy="16" r="11" fill="#e2d4fe" opacity="0.7"/>
      <circle cx="16" cy="16" r="5" fill="#7a4bdf" opacity="0.8"/>
    </svg>
  )
}

const HOBBIES = [
  // Creative (8)
  { name: 'Painting', icon: '', category: 'Creative' },
  { name: 'Photography', icon: '', category: 'Creative' },
  { name: 'Writing', icon: '', category: 'Creative' },
  { name: 'Drawing', icon: '', category: 'Creative' },
  { name: 'Music', icon: '', category: 'Creative' },
  { name: 'Dancing', icon: '', category: 'Creative' },
  { name: 'Illustration', icon: '', category: 'Creative' },
  { name: 'Filmmaking', icon: '', category: 'Creative' },
  // Life Skills (8)
  { name: 'Cooking', icon: '', category: 'Life Skills' },
  { name: 'Baking', icon: '', category: 'Life Skills' },
  { name: 'Sewing', icon: '', category: 'Life Skills' },
  { name: 'Origami', icon: '', category: 'Life Skills' },
  { name: 'Calligraphy', icon: '', category: 'Life Skills' },
  { name: 'DIY Projects', icon: '', category: 'Life Skills' },
  { name: 'Candle Making', icon: '', category: 'Life Skills' },
  { name: 'Home Decor', icon: '', category: 'Life Skills' },
  // Nature (8)
  { name: 'Gardening', icon: '', category: 'Nature' },
  { name: 'Hiking', icon: '', category: 'Nature' },
  { name: 'Bird Watching', icon: '', category: 'Nature' },
  { name: 'Rock Climbing', icon: '', category: 'Nature' },
  { name: 'Camping', icon: '', category: 'Nature' },
  { name: 'Fishing', icon: '', category: 'Nature' },
  { name: 'Stargazing', icon: '', category: 'Nature' },
  { name: 'Foraging', icon: '', category: 'Nature' },
  // Well-being (8)
  { name: 'Yoga', icon: '', category: 'Well-being' },
  { name: 'Meditation', icon: '', category: 'Well-being' },
  { name: 'Journaling', icon: '', category: 'Well-being' },
  { name: 'Breathwork', icon: '', category: 'Well-being' },
  { name: 'Tai Chi', icon: '', category: 'Well-being' },
  { name: 'Sound Healing', icon: '', category: 'Well-being' },
  { name: 'Walking', icon: '', category: 'Well-being' },
  { name: 'Stretching', icon: '', category: 'Well-being' },
  // Fitness (8)
  { name: 'Running', icon: '', category: 'Fitness' },
  { name: 'Swimming', icon: '', category: 'Fitness' },
  { name: 'Cycling', icon: '', category: 'Fitness' },
  { name: 'Weightlifting', icon: '', category: 'Fitness' },
  { name: 'Boxing', icon: '', category: 'Fitness' },
  { name: 'Tennis', icon: '', category: 'Fitness' },
  { name: 'Pilates', icon: '', category: 'Fitness' },
  { name: 'Martial Arts', icon: '', category: 'Fitness' },
  // Knowledge (8)
  { name: 'Reading', icon: '', category: 'Knowledge' },
  { name: 'Coding', icon: '', category: 'Knowledge' },
  { name: 'Language Learning', icon: '', category: 'Knowledge' },
  { name: 'Philosophy', icon: '', category: 'Knowledge' },
  { name: 'History', icon: '', category: 'Knowledge' },
  { name: 'Astronomy', icon: '', category: 'Knowledge' },
  { name: 'Psychology', icon: '', category: 'Knowledge' },
  { name: 'Investing', icon: '', category: 'Knowledge' },
  // Mind (8)
  { name: 'Chess', icon: '', category: 'Mind' },
  { name: 'Puzzles', icon: '', category: 'Mind' },
  { name: 'Sudoku', icon: '', category: 'Mind' },
  { name: 'Memory Training', icon: '', category: 'Mind' },
  { name: 'Strategy Games', icon: '', category: 'Mind' },
  { name: 'Crosswords', icon: '', category: 'Mind' },
  { name: 'Debate', icon: '', category: 'Mind' },
  { name: 'Visualization', icon: '', category: 'Mind' },
  // Crafts (8)
  { name: 'Knitting', icon: '', category: 'Crafts' },
  { name: 'Pottery', icon: '', category: 'Crafts' },
  { name: 'Woodworking', icon: '', category: 'Crafts' },
  { name: 'Embroidery', icon: '', category: 'Crafts' },
  { name: 'Jewelry Making', icon: '', category: 'Crafts' },
  { name: 'Leatherwork', icon: '', category: 'Crafts' },
  { name: 'Soap Making', icon: '', category: 'Crafts' },
  { name: 'Weaving', icon: '', category: 'Crafts' },
]

const LEARNING_METHODS = [
  { id: 'youtube', label: 'YouTube & Online Videos', icon: '▶️' },
  { id: 'course', label: 'Online Course', icon: '🎓' },
  { id: 'books', label: 'Books & Guides', icon: '📖' },
  { id: 'class', label: 'Local Class or Workshop', icon: '🏫' },
  { id: 'mentor', label: 'Find a Mentor', icon: '👨‍🏫' },
  { id: 'self', label: 'Self-Taught Practice', icon: '🔄' },
]

type Milestone = { stage: string; title: string; targetMonth: number; completedAt: string | null }

// 7 stages, spread across chosen duration
function buildMilestones(months: 6 | 9): Milestone[] {
  const targets = months === 6
    ? [1, 1, 2, 3, 4, 5, 6]
    : [1, 2, 3, 4, 6, 7, 9]
  const stages = [
    { stage: 'knowledge',  title: 'Gather basic knowledge, find one resource and understand the landscape' },
    { stage: 'equipment',  title: 'Acquire what you need to begin, thoughtfully and without excess' },
    { stage: 'guides',     title: 'Follow a step-by-step guide, let structure carry you forward' },
    { stage: 'practice',   title: 'Commit to regular practice, consistency is what compounds' },
    { stage: 'community',  title: 'Join a community, shared practice accelerates what solitude cannot' },
    { stage: 'technique',  title: 'Try a new technique, approach it with curiosity, not pressure' },
    { stage: 'feedback',   title: 'Seek honest feedback, what others reflect back will guide you precisely' },
  ]
  return stages.map((s, i) => ({ ...s, targetMonth: targets[i], completedAt: null }))
}

// 3 rotating weekly messages per stage; {hobby} is replaced with hobby name at render time
const STAGE_MESSAGES: { stage: string; msgs: [string, string][] }[] = [
  {
    stage: 'knowledge',
    msgs: [
      ['Begin with curiosity', 'Your {hobby} journey starts here. Find one article or short tutorial today, not to master anything yet, just to understand the landscape ahead of you.'],
      ['Knowledge is your first tool', 'One well-chosen piece of information about {hobby} will carry you further than rushing to begin. Take a few minutes to explore the basics today.'],
      ['Set your first intention', 'What would you like to feel capable of in {hobby} one week from now? A quiet intention set now will shape everything that follows.'],
    ],
  },
  {
    stage: 'equipment',
    msgs: [
      ['Gather what you need, thoughtfully', "You don't need everything at once to begin {hobby}. Identify the two or three essentials and acquire them with intention, not urgency."],
      ['Quality over quantity', 'The right tools make {hobby} feel deliberate and enjoyable. A modest, well-chosen setup is worth far more than an overwhelming one.'],
      ['A moment of preparation', 'Before diving in, pause. Do you have what you need to begin {hobby} well? A few minutes of preparation now saves hours of frustration later.'],
    ],
  },
  {
    stage: 'guides',
    msgs: [
      ['Let structure carry you', 'A well-made guide for {hobby} is a gift, it holds the experience of those who came before you. Follow one this week and let it do the work.'],
      ['One deliberate step', 'Progress in {hobby} is made one carefully chosen step at a time. Today\'s focus is not mastery, it is simply the next small thing.'],
      ['You are exactly where you need to be', 'Find something, a tutorial, a chapter, a demonstration, that takes your {hobby} practice one step further. There is no rush.'],
    ],
  },
  {
    stage: 'practice',
    msgs: [
      ['Show up for yourself', 'Thirty minutes of {hobby} today, not to impress anyone, not to perform. Just to be present with something that belongs entirely to you.'],
      ['Consistency is the real practice', 'How has your {hobby} practice felt this week? Consistent effort, even imperfect effort, is what compounds quietly over time.'],
      ['Try one new thing today', 'Give yourself permission to explore something slightly different within {hobby}. You are not performing, you are still discovering.'],
    ],
  },
  {
    stage: 'community',
    msgs: [
      ['Good company accelerates everything', 'Find one community, online or local, where others share your interest in {hobby}. You will grow faster in good company than in isolation.'],
      ['Share a piece of your journey', 'Offer a glimpse of where you are with {hobby}. You may find that others are further behind than you assumed, and further ahead than you realised.'],
      ['One well-asked question', 'A single thoughtful question to someone more experienced in {hobby} can save you weeks of unnecessary confusion. It is worth asking.'],
    ],
  },
  {
    stage: 'technique',
    msgs: [
      ['A quiet invitation to try something new', 'There is a technique in {hobby} you have not explored yet. Approach it with curiosity today, not pressure, not expectation. Just openness.'],
      ['Deliberate experimentation', 'Comfort zones in {hobby} are useful until they are not. One intentional attempt at something different this week is enough to shift your trajectory.'],
      ['Growth happens in quiet pivots', 'What is one thing you could do differently in {hobby} today? The most meaningful progress rarely announces itself, it simply happens, once you try.'],
    ],
  },
  {
    stage: 'feedback',
    msgs: [
      ['Your work has value', 'Ask someone whose perspective you trust to offer honest thoughts on your {hobby} progress. You are ready to hear it, and it will guide you precisely.'],
      ['Sharing opens new doors', 'Have you shared what you have made or learned through {hobby}? Even a brief response from someone else will move you forward more than solitary practice.'],
      ['You have come further than you realise', 'Pause and look back at where you began with {hobby}. The distance between then and now is greater than it feels from the inside.'],
    ],
  },
]

function getWeeklyHobbyNotif(hobby: Hobby): { title: string; body: string } {
  if (hobby.milestones.every(m => !!m.completedAt)) {
    return {
      title: 'You have completed this journey',
      body: `Every stage of your ${hobby.name} practice is behind you. That is a genuine achievement, and when you are ready, a new chapter awaits.`,
    }
  }
  const daysSinceStart = Math.floor((Date.now() - new Date(hobby.startDate).getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.max(0, Math.floor(daysSinceStart / 7))
  const totalWeeks = hobby.durationMonths === 6 ? 26 : 39
  const stageIndex = Math.min(6, Math.floor((weekNumber * 7) / totalWeeks))
  const msgIndex = weekNumber % 3
  const stageData = STAGE_MESSAGES[stageIndex]
  const [title, body] = stageData.msgs[msgIndex]
  return { title, body: body.replace(/\{hobby\}/g, hobby.name) }
}

type HobbyStatus = 'active' | 'paused' | 'completed'
type Hobby = { name: string; icon: string; learningMethod: string; startDate: string; milestones: Milestone[]; durationMonths: 6 | 9; status?: HobbyStatus }
type Step = 'pick' | 'learn' | 'tracker'

type Profile = Record<string, string | string[]>

function scoreHobby(h: { name: string; category: string }, profile: Profile): number {
  let score = 0
  const desire = profile.microDesire as string | undefined
  const motivators = (profile.primaryMotivators as string[] | undefined) ?? []
  const relaxation = (profile.relaxationTriggers as string[] | undefined) ?? []
  const intervention = profile.targetIntervention as string | undefined
  const fatigue = profile.fatigueState as string | undefined

  // Category affinity
  if (desire === 'Creativity' && ['Creative', 'Crafts'].includes(h.category)) score += 3
  if (desire === 'Fitness' && ['Fitness', 'Nature'].includes(h.category)) score += 3
  if (desire === 'Learning' && ['Knowledge', 'Mind'].includes(h.category)) score += 3
  if (desire === 'Resting' && h.category === 'Well-being') score += 3
  if (desire === 'Socializing' && ['Creative', 'Fitness'].includes(h.category)) score += 1

  if (intervention === 'Less stress' && h.category === 'Well-being') score += 2
  if (intervention === 'Better focus' && ['Mind', 'Knowledge'].includes(h.category)) score += 2
  if (intervention === 'More energy' && h.category === 'Fitness') score += 2
  if (intervention === 'Better mood' && ['Creative', 'Well-being'].includes(h.category)) score += 2

  if (motivators.includes('Health') && ['Fitness', 'Well-being'].includes(h.category)) score += 2
  if (motivators.includes('Personal growth') && ['Knowledge', 'Mind'].includes(h.category)) score += 2
  if (motivators.includes('Achievement') && ['Fitness', 'Mind'].includes(h.category)) score += 1

  if (fatigue === 'Tired' && h.category === 'Well-being') score += 1
  if (fatigue === 'Stressed' && h.category === 'Well-being') score += 1
  if (fatigue === 'Energized' && ['Fitness', 'Nature'].includes(h.category)) score += 1

  // Individual hobby affinity
  if (relaxation.includes('Music') && ['Music', 'Dancing'].includes(h.name)) score += 2
  if (relaxation.includes('Walking') && ['Walking', 'Hiking'].includes(h.name)) score += 2
  if (relaxation.includes('Exercise') && ['Swimming', 'Cycling', 'Running'].includes(h.name)) score += 2
  if (relaxation.includes('Quiet time') && ['Yoga', 'Meditation', 'Breathwork', 'Tai Chi', 'Journaling'].includes(h.name)) score += 2
  if (motivators.includes('Money') && ['Investing', 'Coding'].includes(h.name)) score += 3
  if (motivators.includes('Personal growth') && ['Philosophy', 'Psychology', 'History'].includes(h.name)) score += 2
  if (intervention === 'Less stress' && ['Journaling', 'Sound Healing', 'Yoga', 'Meditation'].includes(h.name)) score += 2
  if (intervention === 'Better focus' && ['Chess', 'Puzzles', 'Sudoku', 'Memory Training', 'Coding'].includes(h.name)) score += 2

  return score
}

export default function HobbiesPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [step, setStep] = useState<Step>('pick')
  const [hobby, setHobby] = useState<Hobby | null>(null)
  const [selected, setSelected] = useState<{ name: string; icon: string } | null>(null)
  const [method, setMethod] = useState('')
  const [duration, setDuration] = useState<6 | 9 | null>(null)
  const [profile, setProfile] = useState<Profile>({})

  // Build the page's hobby view from the DB response (single source of truth).
  // Milestone titles come from the local builder; completion state is merged
  // from the DB Hobby doc by stage so checkmarks persist across devices.
  function fromDb(data: { hobby: unknown; planHobby: unknown }): Hobby | null {
    const dbHobby = data.hobby as (Record<string, unknown> & { milestones?: { stage: string; completedAt?: string | null }[] }) | null
    const plan = data.planHobby as (Record<string, unknown>) | null
    const src = plan ?? dbHobby
    if (!src) return null
    const durationMonths = ((plan?.duration as number) ?? 6) === 9 ? 9 : 6
    const doneByStage = new Map((dbHobby?.milestones ?? []).map(m => [m.stage, m.completedAt ?? null]))
    return {
      name: String(src.name),
      icon: String((dbHobby?.icon as string) ?? ''),
      learningMethod: String((src.learningMethod as string) ?? ''),
      startDate: new Date(((plan?.startedAt as string) ?? (dbHobby?.startDate as string) ?? Date.now())).toISOString(),
      durationMonths,
      status: ((src.status as HobbyStatus) ?? 'active'),
      milestones: buildMilestones(durationMonths).map(m => ({ ...m, completedAt: doneByStage.get(m.stage) ?? null })),
    }
  }

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('unicorn_profile') || '{}')
      setProfile(p)
    } catch {}

    // DB is authoritative. Fetch it; localStorage is only a fallback cache if
    // the request fails (offline), never an independent source.
    // If an active hobby already exists, managing it lives on Profile & Settings.
    // This page is only for picking a (new) hobby.
    fetch('/api/hobbies')
      .then(r => r.json())
      .then(data => {
        const h = fromDb(data)
        if (h && h.status === 'active') {
          router.replace('/profile')
        } else {
          localStorage.removeItem('unicorn_hobby')
          setHobby(null); setStep('pick')
        }
      })
      .catch(() => {})
  }, [router])

  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirm, setConfirm] = useState<null | 'replace' | 'delete'>(null)

  // Write to the DB first (source of truth), then reflect it locally. Awaited so
  // we never show a hobby the DB didn't accept.
  async function saveHobby() {
    if (!selected || !method || !duration) return
    setBusy(true); setFeedback(null)
    try {
      const res = await fetch('/api/hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected.name, icon: selected.icon, learningMethod: method, duration }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // Managing the hobby lives on Profile & Settings; go there after picking.
      router.push('/profile')
    } catch {
      setFeedback({ kind: 'error', text: 'Could not save your hobby. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  // Change lifecycle status via the API (source of truth for weekly check-ins),
  // then reflect it locally. Surfaces errors instead of assuming success.
  async function changeStatus(status: HobbyStatus, okText: string) {
    setBusy(true); setFeedback(null)
    try {
      const res = await fetch('/api/hobbies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setHobby(prev => {
        if (!prev) return prev
        const updated = { ...prev, status }
        localStorage.setItem('unicorn_hobby', JSON.stringify(updated))
        return updated
      })
      setFeedback({ kind: 'ok', text: okText })
    } catch {
      setFeedback({ kind: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  async function doReplace() {
    setConfirm(null); setBusy(true); setFeedback(null)
    try {
      // Archive the current hobby as completed so its check-ins stop and history stays.
      await fetch('/api/hobbies', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      resetHobby()
    } catch {
      setFeedback({ kind: 'error', text: 'Could not switch hobby. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  async function doDelete() {
    setConfirm(null); setBusy(true); setFeedback(null)
    try {
      const res = await fetch('/api/hobbies', { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      resetHobby()
    } catch {
      setFeedback({ kind: 'error', text: 'Could not remove hobby. Please try again.' })
      setBusy(false)
    }
  }

  async function updateMilestone(stage: string, completed: boolean) {
    setHobby(prev => {
      if (!prev) return prev
      const updated = { ...prev, milestones: prev.milestones.map(m => m.stage === stage ? { ...m, completedAt: completed ? new Date().toISOString() : null } : m) }
      localStorage.setItem('unicorn_hobby', JSON.stringify(updated))
      return updated
    })
    // Persist milestone completion to the DB so it survives across devices.
    await fetch('/api/hobbies', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneStage: stage, completed }),
    }).catch(() => {})
  }

  function resetHobby() { localStorage.removeItem('unicorn_hobby'); setHobby(null); setSelected(null); setMethod(''); setDuration(null); setStep('pick') }

  const categories = Array.from(new Set(HOBBIES.map(h => h.category)))

  const hasProfile = Object.keys(profile).length > 0
  const scoredHobbies = hasProfile
    ? [...HOBBIES].sort((a, b) => scoreHobby(b, profile) - scoreHobby(a, profile))
    : HOBBIES
  const forYou = hasProfile ? scoredHobbies.slice(0, 4) : []

  function HobbyButton({ h }: { h: typeof HOBBIES[0] }) {
    return (
      <button
        onClick={() => { setSelected(h); setStep('learn') }}
        className="flex flex-col items-center p-3 rounded-xl bg-white border border-border hover:border-velvet-300 hover:shadow-md transition-all group"
      >
        <div className="mb-1.5 group-hover:scale-110 transition-transform">
          <HobbyIcon name={h.name} />
        </div>
        <span className="text-xs font-medium text-gray-700 text-center leading-tight">{h.name}</span>
      </button>
    )
  }

  // --- PICK step ---
  if (step === 'pick') return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('hobbiesTitle')}</h1>

      {forYou.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">For You</h3>
          <div className="grid grid-cols-4 gap-3">
            {forYou.map(h => <HobbyButton key={h.name} h={h} />)}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map(cat => {
          const items = HOBBIES.filter(h => h.category === cat)
          if (!items.length) return null
          return (
            <div key={cat}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {items.map(h => <HobbyButton key={h.name} h={h} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // --- LEARN step ---
  if (step === 'learn' && selected) return (
    <div className="space-y-6">
      <button onClick={() => setStep('pick')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t('hobbiesBackToHobbies')}
      </button>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-velvet-50 border border-velvet-100 flex items-center justify-center">
          <HobbyIcon name={selected.name} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
          <p className="text-muted-foreground">{t('hobbiesHowLearnIt')}</p>
        </div>
      </div>

      {/* Learning method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEARNING_METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.label)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${method === m.label ? 'border-velvet-500 bg-velvet-50 ring-2 ring-velvet-400/20' : 'border-border bg-white hover:border-velvet-200 hover:shadow-sm'}`}
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-sm font-medium text-gray-800">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">How long do you want to commit?</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {([6, 9] as const).map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`p-4 rounded-xl border text-left transition-all ${duration === d ? 'border-velvet-500 bg-velvet-50 ring-2 ring-velvet-400/20' : 'border-border bg-white hover:border-velvet-200 hover:shadow-sm'}`}
            >
              <p className="text-xl font-black text-velvet-500">{d}</p>
              <p className="text-sm font-semibold text-gray-800">months</p>
              <p className="text-xs text-muted-foreground mt-1">
                {d === 6 ? '12 milestones · focused path' : '13 milestones · deep mastery'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={saveHobby}
        disabled={!method || !duration}
        className="h-12 px-8 bg-velvet-500 text-white hover:bg-velvet-600 font-semibold rounded-xl"
      >
        {t('hobbiesStartJourney')}
      </Button>
    </div>
  )


  return null
}
