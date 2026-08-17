import { useEffect, useState } from 'react'
import type { Bundle } from '@shared/bundle'

function App(): React.JSX.Element {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [name, setName] = useState('')

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
    </div>
  )
}

export default App