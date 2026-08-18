import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Bundle, ApplicationSnapshot } from '../shared/bundle'
import type { DetectedWindow } from '../shared/window'

const api = {
  bundles: {
    list: (): Promise<Bundle[]> => ipcRenderer.invoke('bundles:list'),
    create: (name: string, applications: ApplicationSnapshot[]): Promise<Bundle> =>
      ipcRenderer.invoke('bundles:create', name, applications),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('bundles:delete', id)
  },
  system: {
    listOpenWindows: (): Promise<DetectedWindow[]> => ipcRenderer.invoke('windows:list')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}