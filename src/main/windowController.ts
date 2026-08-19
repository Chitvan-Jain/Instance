import { spawn } from 'node:child_process'
import type { Bounds } from '../shared/bundle'
import type { DetectedWindow } from '../shared/window'
import { listOpenWindows } from './windowInspector'

export function launchApplication(executablePath: string, args: string[] = []): number {
  const child = spawn(executablePath, args, {
    detached: true,
    stdio: 'ignore'
  })
  child.unref()

  if (child.pid === undefined) {
    throw new Error(`Failed to launch ${executablePath}`)
  }
  return child.pid
}

export function snapshotWindowIds(): Set<number> {
  return new Set(listOpenWindows().map((w) => w.id))
}

// Matches a window either by exact process ID (works for well-behaved apps)
// or by being a brand-new window with a matching title (covers apps that
// relaunch themselves under a different process, e.g. Windows Store apps).
export async function waitForNewWindow(
  baselineWindowIds: Set<number>,
  processId: number,
  titleHint: string,
  timeoutMs = 10000,
  pollIntervalMs = 300
): Promise<DetectedWindow | null> {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const match = listOpenWindows().find((w) => {
      const isNew = !baselineWindowIds.has(w.id)
      const matchesProcess = w.processId === processId
      const matchesTitle = titleHint.length > 0 && w.title.includes(titleHint)
      return isNew && (matchesProcess || matchesTitle)
    })

    if (match) return match
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  return null
}

const WIN32_TYPE_DEFINITION = `
using System;
using System.Runtime.InteropServices;
public class DeskFlowWin32 {
  [DllImport("user32.dll")]
  public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
}
`

export function setWindowBounds(windowId: number, bounds: Bounds): Promise<void> {
  const psCommand = [
    `Add-Type -TypeDefinition '${WIN32_TYPE_DEFINITION}'`,
    `[DeskFlowWin32]::MoveWindow([IntPtr]${windowId}, ${bounds.x}, ${bounds.y}, ${bounds.width}, ${bounds.height}, $true)`
  ].join('; ')

  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', psCommand])

    let stderr = ''
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to move window ${windowId}: ${stderr}`))
      }
    })

    child.on('error', reject)
  })
}