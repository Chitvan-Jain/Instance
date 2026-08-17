import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Bundle } from '../shared/bundle'

// Custom APIs for renderer
const api = {
  bundles: {
    list: (): Promise<Bundle[]> => ipcRenderer.invoke('bundles:list'),
    create: (name: string): Promise<Bundle> => ipcRenderer.invoke('bundles:create', name),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('bundles:delete', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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