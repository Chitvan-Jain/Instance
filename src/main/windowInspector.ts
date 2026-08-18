import { openWindowsSync } from 'get-windows'
import type { DetectedWindow } from '../shared/window'

export function listOpenWindows(): DetectedWindow[] {
  const windows = openWindowsSync()
  return windows.map((w) => ({
    id: w.id,
    title: w.title,
    processId: w.owner.processId,
    executablePath: w.owner.path,
    bounds: w.bounds
  }))
}