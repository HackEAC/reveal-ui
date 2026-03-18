import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = path.join(rootDir, '.tmp')
const smokeDir = path.join(tempRoot, 'smoke-consumer')
const smokePackageJsonPath = path.join(smokeDir, 'package.json')
const expectedExports = [
  'RevealClose',
  'RevealGroup',
  'RevealPanel',
  'RevealSplitter',
  'RevealTrigger',
  'useRevealPanelState',
]
const rootPackageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'))

mkdirSync(tempRoot, { recursive: true })
rmSync(smokeDir, { force: true, recursive: true })
mkdirSync(smokeDir, { recursive: true })

const packOutput = execFileSync('npm', ['pack', '--json'], {
  cwd: rootDir,
  encoding: 'utf8',
})
const packResult = JSON.parse(packOutput)
const tarballName = packResult[0]?.filename

if (!tarballName) {
  throw new Error('npm pack did not produce a tarball filename.')
}

const tarballPath = path.join(rootDir, tarballName)
const smokePackageJson = {
  name: 'reveal-ui-smoke-consumer',
  private: true,
  dependencies: {
    motion: rootPackageJson.peerDependencies.motion,
    react: rootPackageJson.peerDependencies.react,
    'react-dom': rootPackageJson.peerDependencies['react-dom'],
    'reveal-ui': `file:${tarballPath}`,
  },
}

writeFileSync(smokePackageJsonPath, `${JSON.stringify(smokePackageJson, null, 2)}\n`)

try {
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: smokeDir,
    stdio: 'inherit',
  })
  execFileSync(
    'node',
    [
      '-e',
      `
const pkg = require('reveal-ui')
const actual = Object.keys(pkg).sort()
const expected = ${JSON.stringify(expectedExports)}
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(\`Unexpected CommonJS exports: \${actual.join(', ')}\`)
}
      `,
    ],
    {
      cwd: smokeDir,
      stdio: 'inherit',
    },
  )
  execFileSync(
    'node',
    [
      '--input-type=module',
      '-e',
      `
const pkg = await import('reveal-ui')
const actual = Object.keys(pkg).sort()
const expected = ${JSON.stringify(expectedExports)}
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(\`Unexpected ESM exports: \${actual.join(', ')}\`)
}
      `,
    ],
    {
      cwd: smokeDir,
      stdio: 'inherit',
    },
  )
} finally {
  if (existsSync(tarballPath)) {
    rmSync(tarballPath)
  }
  rmSync(smokeDir, { force: true, recursive: true })
}
