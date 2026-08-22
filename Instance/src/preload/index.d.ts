import { ElectronAPI } from '@electron-toolkit/preload'
import type { Bundle, ApplicationSnapshot } from '../shared/bundle'
import type { DetectedWindow } from '../shared/window'
import type { RestoreResult } from '../shared/restore'

interface BundleAPI {
  list: () => Promise<Bundle[]>
  create: (name: string, applications: ApplicationSnapshot[]) => Promise<Bundle>
  delete: (id: string) => Promise<void>
  launch: (id: string) => Promise<RestoreResult[]>
}

interface SystemAPI {
  listOpenWindows: () => Promise<DetectedWindow[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      bundles: BundleAPI
      system: SystemAPI
    }
  }
}