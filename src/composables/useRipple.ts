export function useRipple() {
  function ripple(event: MouseEvent): void {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement)) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const span = document.createElement('span')

    span.className = 'ripple'
    span.style.width = `${size}px`
    span.style.height = `${size}px`
    span.style.left = `${event.clientX - rect.left - size / 2}px`
    span.style.top = `${event.clientY - rect.top - size / 2}px`

    target.appendChild(span)
    window.setTimeout(() => span.remove(), 600)
  }

  return { ripple }
}