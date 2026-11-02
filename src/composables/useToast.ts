import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
  remaining: number
  startedAt: number
}

const toasts = ref<ToastItem[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let counter = 0

function schedule(toast: ToastItem): void {
  toast.startedAt = Date.now()
  const timer = setTimeout(() => remove(toast.id), Math.max(toast.remaining, 300))
  timers.set(toast.id, timer)
}

function show(message: string, type: ToastType = 'info', duration = 3000): number {
  counter += 1
  const toast: ToastItem = {
    id: counter,
    message,
    type,
    duration,
    remaining: duration,
    startedAt: Date.now(),
  }
  toasts.value.push(toast)
  schedule(toast)
  return toast.id
}

function remove(id: number): void {
  const timer = timers.get(id)
  if (timer) clearTimeout(timer)
  timers.delete(id)
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function pause(id: number): void {
  const toast = toasts.value.find((item) => item.id === id)
  if (!toast) return
  const timer = timers.get(id)
  if (timer) clearTimeout(timer)
  timers.delete(id)
  toast.remaining = Math.max(toast.duration - (Date.now() - toast.startedAt), 0)
}

function resume(id: number): void {
  const toast = toasts.value.find((item) => item.id === id)
  if (!toast) return
  toast.remaining = Math.max(toast.remaining, 900)
  schedule(toast)
}

function clear(): void {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  toasts.value = []
}

const success = (message: string, duration = 3000) => show(message, 'success', duration)
const error = (message: string, duration = 3600) => show(message, 'error', duration)
const warning = (message: string, duration = 3200) => show(message, 'warning', duration)
const info = (message: string, duration = 3000) => show(message, 'info', duration)

export function useToast() {
  return { toasts, show, remove, pause, resume, clear, success, error, warning, info }
}