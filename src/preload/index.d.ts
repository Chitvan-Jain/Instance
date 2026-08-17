import { ElectronAPI } from '@electron-toolkit/preload'
import type { Bundle } from '../shared/bundle'

interface BundleAPI {
  list: () => Promise<Bundle[]>
  create: (name: string) => Promise<Bundle>
  delete: (id: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      bundles: BundleAPI
    }
  }
}