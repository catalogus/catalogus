import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const maxLines = 350
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  '.output',
  '.vinxi',
  'coverage',
])

const excludedFiles = new Set([
  path.join('src', 'routeTree.gen.ts'),
])

const excludedDirectoryPrefixes = [
  `${path.join('src', 'i18n', 'translations')}${path.sep}`,
]

const includedRoots = [path.join(rootDir, 'src'), path.join(rootDir, 'services', 'mpesa-gateway', 'src')]

const toPosixRelative = (absolutePath) => path.relative(rootDir, absolutePath).split(path.sep).join('/')

const isExcluded = (relativePath) => {
  if (excludedFiles.has(relativePath)) return true

  return excludedDirectoryPrefixes.some((prefix) => relativePath.startsWith(prefix.split(path.sep).join('/')))
}

const collectFiles = async (directory) => {
  const results = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue

    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      results.push(...(await collectFiles(absolutePath)))
      continue
    }

    if (!entry.isFile()) continue
    if (!codeExtensions.has(path.extname(entry.name))) continue

    const relativePath = toPosixRelative(absolutePath)
    if (isExcluded(relativePath)) continue

    results.push({ absolutePath, relativePath })
  }

  return results
}

const countLines = async (absolutePath) => {
  const content = await readFile(absolutePath, 'utf8')
  if (content.length === 0) return 0
  return content.split(/\r?\n/).length
}

const existingRoots = []
for (const directory of includedRoots) {
  try {
    const info = await stat(directory)
    if (info.isDirectory()) existingRoots.push(directory)
  } catch {
    // Ignore missing optional directories.
  }
}

const files = []
for (const directory of existingRoots) {
  files.push(...(await collectFiles(directory)))
}

const offenders = []
for (const file of files) {
  const lines = await countLines(file.absolutePath)
  if (lines > maxLines) {
    offenders.push({ relativePath: file.relativePath, lines })
  }
}

offenders.sort((a, b) => b.lines - a.lines || a.relativePath.localeCompare(b.relativePath))

if (offenders.length > 0) {
  console.error(`Found ${offenders.length} files over ${maxLines} lines:`)
  for (const offender of offenders) {
    console.error(`- ${offender.relativePath}: ${offender.lines}`)
  }
  process.exit(1)
}

console.log(`All checked code files are at or below ${maxLines} lines.`)
