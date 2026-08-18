export interface DetectedWindow {
  id: number
  title: string
  processId: number
  executablePath: string
  bounds: { x: number; y: number; width: number; height: number }
}