#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const dsl = require('../index')

const argv = yargs(hideBin(process.argv))
  .command('$0 <script>', 'Generate an SVG comic from a DSL script', (yargs) => {
    yargs.positional('script', { describe: 'Path to the DSL script file', type: 'string' })
    yargs.option('output', { alias: 'o', describe: 'Output file path (default: same name as script with .svg)', type: 'string' })
    yargs.option('open', { describe: 'Open the output in default browser', type: 'boolean', default: false })
  })
  .help()
  .argv

const scriptPath = path.resolve(argv.script)
if (!fs.existsSync(scriptPath)) {
  console.error(`File not found: ${scriptPath}`)
  process.exit(1)
}

const scriptDir = path.dirname(scriptPath)
const scriptCode = fs.readFileSync(scriptPath, 'utf-8')

const api = { ...dsl, fs: { writeFileSync: fs.writeFileSync.bind(fs), readFileSync: fs.readFileSync.bind(fs) } }

const contextCode = Object.keys(api).map(k => `const ${k} = __stickyfig__.${k}`).join('; ')

let result
try {
  const fn = new Function('__stickyfig__', `${contextCode}; ${scriptCode}`)
  result = fn(api)
} catch (err) {
  console.error('Error executing script:', err.message)
  process.exit(1)
}

let outputSvg = null

if (result && typeof result.render === 'function') {
  outputSvg = result.render()
} else {
  for (const name of ['comic', 'strip', 'myStrip', 'myComic', 'panel']) {
    if (global[name] && typeof global[name].render === 'function') {
      outputSvg = global[name].render()
      break
    }
  }
}

if (!outputSvg) {
  const match = scriptCode.match(/const\s+(\w+)\s*=\s*strip\s*\(/)
  if (match) {
    console.error(`Found strip variable "${match[1]}" but could not render it. Make sure it's returned or accessible.`)
  }
  console.error('No renderable strip found. Make sure your script either returns the strip or saves it manually.')
  process.exit(1)
}

let outputPath = argv.output
if (!outputPath) {
  const baseName = path.basename(scriptPath, path.extname(scriptPath))
  outputPath = path.join(scriptDir, `${baseName}.svg`)
}

fs.writeFileSync(outputPath, outputSvg)
console.log(`Comic saved to ${outputPath}`)

if (argv.open) {
  const { exec } = require('child_process')
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  exec(`${cmd} "${outputPath}"`)
}