import type { ApplicationSnapshot } from './bundle'

export interface DetectedWindow {
  id: number
  title: string
  processId: number
  executablePath: string
  bounds: { x: number; y: number; width: number; height: number }
}

export function toApplicationSnapshot(w: DetectedWindow): ApplicationSnapshot {
  // Windows parks minimized windows off-screen at (-32000, -32000) — a free
  // signal we noticed back in step 3, now put to use.
  const isMinimized = w.bounds.x <= -30000 && w.bounds.y <= -30000

  return {
    executablePath: w.executablePath,
    launchArguments: [],
    windowTitleHint: w.title,
    bounds: w.bounds,
    state: isMinimized ? 'minimized' : 'normal',
    monitorId: null,
    appType: 'generic'
  }
}