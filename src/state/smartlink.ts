/**
 * The other half of the 'applink' payload: a code encodes #/go?w=…&i=…&a=…,
 * and the page it lands on picks the destination for the phone holding it.
 */
export function resolveSmartLink(hash: string, userAgent: string): string | null {
  if (!hash.startsWith('#/go?')) return null
  const p = new URLSearchParams(hash.slice(5))
  const ios = p.get('i')
  const android = p.get('a')
  const web = p.get('w')
  const pick = /iPhone|iPad|iPod/i.test(userAgent) ? ios : /Android/i.test(userAgent) ? android : null
  const target = pick || web
  return target && /^https?:\/\//i.test(target) ? target : null
}
