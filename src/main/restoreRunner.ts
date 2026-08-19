import type { Bundle, ApplicationSnapshot } from '../shared/bundle'
import type { RestoreResult } from '../shared/restore'
import { launchApplication, waitForWindowByProcessId, setWindowBounds } from './windowController'

export async function restoreBundle(bundle: Bundle): Promise<RestoreResult[]> {
  const results: RestoreResult[] = []

  for (const app of bundle.applications) {
    results.push(await restoreApplication(app))
  }

  return results
}

async function restoreApplication(app: ApplicationSnapshot): Promise<RestoreResult> {
  try {
    const pid = launchApplication(app.executablePath, app.launchArguments)
    const win = await waitForWindowByProcessId(pid)

    if (!win) {
      return {
        windowTitleHint: app.windowTitleHint,
        status: 'failed',
        error: 'Window did not appear in time'
      }
    }

    await setWindowBounds(win.id, app.bounds)

    return { windowTitleHint: app.windowTitleHint, status: 'launched' }
  } catch (err) {
    return {
      windowTitleHint: app.windowTitleHint,
      status: 'failed',
      error: err instanceof Error ? err.message : String(err)
    }
  }
}