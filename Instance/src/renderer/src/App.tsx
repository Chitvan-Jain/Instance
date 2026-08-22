import { useEffect, useState } from 'react'
import type { Bundle } from '@shared/bundle'
import type { DetectedWindow } from '@shared/window'
import type { RestoreResult } from '@shared/restore'
import { toApplicationSnapshot } from '@shared/window'

function App(): React.JSX.Element {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [name, setName] = useState('')
  const [openWindows, setOpenWindows] = useState<DetectedWindow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [restoreResults, setRestoreResults] = useState<Record<string, RestoreResult[]>>({})
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    const list = await window.api.bundles.list()
    setBundles(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) return

    const applications = openWindows
      .filter((w) => selectedIds.has(w.id))
      .map(toApplicationSnapshot)

    await window.api.bundles.create(name.trim(), applications)
    setName('')
    setSelectedIds(new Set())
    refresh()
  }

  const handleDelete = async (id: string): Promise<void> => {
    await window.api.bundles.delete(id)
    refresh()
  }

  const handleLaunch = async (id: string): Promise<void> => {
    setRestoringId(id)
    try {
      const results = await window.api.bundles.launch(id)
      setRestoreResults((prev) => ({ ...prev, [id]: results }))
    } finally {
      setRestoringId(null)
    }
  }

  const handleScanWindows = async (): Promise<void> => {
    const windows = await window.api.system.listOpenWindows()
    setOpenWindows(windows)
    setSelectedIds(new Set())
  }

  const toggleSelected = (id: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Project Bundler</h1>

      <div style={{ marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bundle name" />
        <button onClick={handleCreate}>Bundle ({selectedIds.size} apps)</button>
      </div>

      <ul>
        {bundles.map((b) => (
          <li key={b.id} style={{ marginBottom: 12 }}>
            <div>
              <strong>{b.name}</strong> ({b.applications.length} apps)
              <button
                onClick={() => handleLaunch(b.id)}
                disabled={restoringId === b.id || b.applications.length === 0}
                style={{ marginLeft: 8 }}
              >
                {restoringId === b.id ? 'Launching…' : 'Launch'}
              </button>
              <button onClick={() => handleDelete(b.id)} style={{ marginLeft: 8 }}>
                Delete
              </button>
            </div>

            {b.applications.length > 0 && (
              <ul style={{ fontSize: 12, color: '#555' }}>
                {b.applications.map((a, i) => (
                  <li key={i}>{a.windowTitleHint || a.executablePath}</li>
                ))}
              </ul>
            )}

            {restoreResults[b.id] && (
              <ul style={{ fontSize: 12 }}>
                {restoreResults[b.id].map((r, i) => (
                  <li key={i} style={{ color: r.status === 'failed' ? 'crimson' : 'green' }}>
                    {r.windowTitleHint || '(app)'}: {r.status}
                    {r.error ? ` — ${r.error}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {bundles.length === 0 && <p>No bundles yet — create one above.</p>}

      <hr style={{ margin: '24px 0' }} />

      <h2>Debug: Open Windows</h2>
      <button onClick={handleScanWindows}>Scan Open Windows</button>
      <span style={{ marginLeft: 12 }}>{selectedIds.size} selected</span>

      <table style={{ marginTop: 12, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th></th>
            <th>Title</th>
            <th>Process ID</th>
            <th>Executable Path</th>
          </tr>
        </thead>
        <tbody>
          {openWindows.map((w) => (
            <tr key={w.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(w.id)}
                  onChange={() => toggleSelected(w.id)}
                />
              </td>
              <td>{w.title || '(no title)'}</td>
              <td>{w.processId}</td>
              <td style={{ fontSize: 12 }}>{w.executablePath}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App