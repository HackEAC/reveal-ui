import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = path.join(rootDir, '.tmp')
const smokeDir = path.join(tempRoot, 'smoke-consumer')
const smokePackageJsonPath = path.join(smokeDir, 'package.json')
const smokeTsconfigPath = path.join(smokeDir, 'tsconfig.json')
const smokeEntryPath = path.join(smokeDir, 'smoke.tsx')
const expectedExports = [
  'RevealClose',
  'RevealGroup',
  'RevealPanel',
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
  devDependencies: {
    '@types/react': rootPackageJson.devDependencies['@types/react'],
    '@types/react-dom': rootPackageJson.devDependencies['@types/react-dom'],
    typescript: rootPackageJson.devDependencies.typescript,
  },
}

writeFileSync(smokePackageJsonPath, `${JSON.stringify(smokePackageJson, null, 2)}\n`)
writeFileSync(
  smokeTsconfigPath,
  `${JSON.stringify(
    {
      compilerOptions: {
        esModuleInterop: true,
        jsx: 'react-jsx',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
      },
      include: ['smoke.tsx'],
    },
    null,
    2,
  )}\n`,
)
writeFileSync(
  smokeEntryPath,
  `import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  RevealClose,
  RevealPanel,
  RevealTrigger,
  type CloseOptions,
  type RevealPanelProps,
  type RevealPhase,
} from 'reveal-ui'

const closeOptions: CloseOptions = { propagate: true, restoreFocus: false }
const phase: RevealPhase = 'open'
const panelProps: Omit<RevealPanelProps, 'children'> = {
  content: ({ close }) => (
    <div>
      <button type="button" onClick={() => close(closeOptions)}>
        {phase}
      </button>
      <RevealClose>Done</RevealClose>
    </div>
  ),
}

const view = (
  <RevealPanel {...panelProps}>
    <RevealPanel.Top>
      <RevealTrigger>Open</RevealTrigger>
    </RevealPanel.Top>
    <RevealPanel.Bottom>
      <div>Bottom</div>
    </RevealPanel.Bottom>
  </RevealPanel>
)

const html = renderToString(view)

if (!html.includes('Open') || !html.includes('Bottom')) {
  throw new Error('Failed to render packaged reveal-ui types and JSX usage.')
}
`,
)

try {
  execFileSync('npm', ['install', '--no-audit', '--no-fund', '--prefer-offline'], {
    cwd: smokeDir,
    stdio: 'inherit',
  })
  execFileSync('npx', ['tsc', '--project', 'tsconfig.json'], {
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
