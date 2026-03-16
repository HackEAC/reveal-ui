import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cjsDir = path.join(rootDir, 'dist', 'cjs')

mkdirSync(cjsDir, { recursive: true })
writeFileSync(path.join(cjsDir, 'package.json'), '{\n  "type": "commonjs"\n}\n')
