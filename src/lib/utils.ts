import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API helpers
export const $get = (t: string) => fetch(`/api/db?t=${t}`).then(r => r.json())
export const $post = (t: string, body: object) => fetch(`/api/db?t=${t}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())
export const $patch = (t: string, body: object) => fetch(`/api/db?t=${t}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())
export const $del = (t: string, id: string) => fetch(`/api/db?t=${t}&id=${id}`, { method: 'DELETE' }).then(r => r.json())

// Currency formatting - exported as both names for compatibility
export const fmt$ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
export const formatCurrency = fmt$
