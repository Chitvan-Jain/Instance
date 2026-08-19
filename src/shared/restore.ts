export interface RestoreResult {
  windowTitleHint: string
  status: 'launched' | 'failed'
  error?: string
}