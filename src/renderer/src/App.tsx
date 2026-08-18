import { useEffect, useState } from 'react'
import type { Bundle } from '@shared/bundle'
import type { DetectedWindow } from '@shared/window'

function App(): React.JSX.Element {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [name, setName] = useState('')
  const [openWindows, setOpenWindows] = useState<DetectedWindow[]>([])

  const refresh = async (): Promise<void> => {
    const list = await window.api.bundles.list()
    setBundles(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) return
    await window.api.bundles.create(name.trim())
    setName('')
    refresh()
  }

  const handleDelete = async (id: string): Promise<void> => {
    await window.api.bundles.delete(id)
    refresh()
  }

  const handleScanWindows = async (): Promise<void> => {
    const windows = await window.api.system.listOpenWindows()
    setOpenWindows(windows)
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Project Bundler</h1>

      <div style={{ marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bundle name" />
        <button onClick={handleCreate}>Bundle</button>
      </div>

      <ul>
        {bundles.map((b) => (
          <li key={b.id}>
            {b.name}
            <button onClick={() => handleDelete(b.id)} style={{ marginLeft: 8 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {bundles.length === 0 && <p>No bundles yet — create one above.</p>}

      <hr style={{ margin: '24px 0' }} />

      <h2>Debug: Open Windows</h2>
      <button onClick={handleScanWindows}>Scan Open Windows</button>

      <table style={{ marginTop: 12, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Title</th>
            <th>Process ID</th>
            <th>Executable Path</th>
          </tr>
        </thead>
        <tbody>
          {openWindows.map((w) => (
            <tr key={w.id} style={{ borderBottom: '1px solid #eee' }}>
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