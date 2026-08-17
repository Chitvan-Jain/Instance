export type WindowState = 'normal' | 'maximized' | 'minimized'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface TabSnapshot {
  url: string
  title: string
  pinned: boolean
  index: number
  groupId: string | null
}

export interface TabGroupSnapshot {
  localId: string
  title: string
  color: string
  collapsed: boolean
}

export interface ChromeWindowSnapshot {
  localId: string
  bounds: Bounds
  state: WindowState
  monitorId: string | null
  activeTabIndex: number
  tabGroups: TabGroupSnapshot[]
  tabs: TabSnapshot[]
}

export type AppType = 'generic' | 'vscode' | 'terminal'

export interface ApplicationSnapshot {
  executablePath: string
  launchArguments: string[]
  windowTitleHint: string
  bounds: Bounds
  state: WindowState
  monitorId: string | null
  appType: AppType
  vscodeProjectPath?: string
  launchDelayHint?: number
}

export interface Bundle {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  schemaVersion: number
  monitorLayoutSignature: string
  chromeWindows: ChromeWindowSnapshot[]
  applications: ApplicationSnapshot[]
}