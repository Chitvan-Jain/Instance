import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Bundle, ApplicationSnapshot } from '../shared/bundle'

const SCHEMA_VERSION = 1

function getStorePath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'bundles.json')
}

function readAll(): Bundle[] {
  const path = getStorePath()
  if (!existsSync(path)) return []
  try {
    const raw = readFileSync(path, 'utf-8')
    return JSON.parse(raw) as Bundle[]
  } catch (err) {
    console.error('Failed to read bundles.json, starting empty:', err)
    return []
  }
}

function writeAll(bundles: Bundle[]): void {
  writeFileSync(getStorePath(), JSON.stringify(bundles, null, 2), 'utf-8')
}

export function listBundles(): Bundle[] {
  return readAll()
}

export function createBundle(name: string, applications: ApplicationSnapshot[]): Bundle {
  const now = new Date().toISOString()
  const bundle: Bundle = {
    id: randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    monitorLayoutSignature: 'unknown',
    chromeWindows: [],
    applications
  }
  const bundles = readAll()
  bundles.push(bundle)
  writeAll(bundles)
  return bundle
}

export function deleteBundle(id: string): void {
  const bundles = readAll().filter((b) => b.id !== id)
  writeAll(bundles)
}