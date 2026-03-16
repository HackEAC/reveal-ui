import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exampleDir = path.join(rootDir, 'examples', 'next-app')
const tempRoot = path.join(rootDir, '.tmp')
const smokeDir = path.join(tempRoot, 'smoke-next-app')

mkdirSync(tempRoot, { recursive: true })
rmSync(smokeDir, { force: true, recursive: true })
cpSync(exampleDir, smokeDir, {
  filter: (source) => {
    const basename = path.basename(source)
    return basename !== '.next' && basename !== 'node_modules'
  },
  recursive: true,
})

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
const examplePackageJsonPath = path.join(smokeDir, 'package.json')
const examplePackageJson = JSON.parse(readFileSync(examplePackageJsonPath, 'utf8'))

examplePackageJson.dependencies['reveal-ui'] = `file:${tarballPath}`
writeFileSync(examplePackageJsonPath, `${JSON.stringify(examplePackageJson, null, 2)}\n`)

try {
  execFileSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: smokeDir,
    stdio: 'inherit',
  })
  execFileSync('npm', ['run', 'build'], {
    cwd: smokeDir,
    stdio: 'inherit',
  })
} finally {
  if (existsSync(tarballPath)) {
    rmSync(tarballPath)
  }
  rmSync(smokeDir, { force: true, recursive: true })
}
