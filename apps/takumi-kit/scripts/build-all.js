#!/usr/bin/env node
/**
 * Build All Widgets Script
 * Builds all widgets in the widgets/ directory
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { execSync } from 'child_process'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const widgetsDir = join(rootDir, 'widgets')

console.log('\\n🔧 Ermite Toolbox - Build All Widgets\\n')
console.log('='.repeat(50))

// Get all widget directories
const widgets = readdirSync(widgetsDir).filter(name => {
  const widgetPath = join(widgetsDir, name)
  const packagePath = join(widgetPath, 'package.json')
  return statSync(widgetPath).isDirectory() && existsSync(packagePath)
})

console.log(`\\n📦 Found ${widgets.length} widget(s) to build:\\n`)
widgets.forEach(w => console.log(`   - ${w}`))
console.log('')

let successCount = 0
let failCount = 0

for (const widget of widgets) {
  const widgetPath = join(widgetsDir, widget)

  console.log(`\\n🔨 Building: ${widget}`)
  console.log('-'.repeat(40))

  try {
    // Install dependencies if node_modules doesn't exist
    const nodeModulesPath = join(widgetPath, 'node_modules')
    if (!existsSync(nodeModulesPath)) {
      console.log('   Installing dependencies...')
      execSync('npm install', { cwd: widgetPath, stdio: 'inherit' })
    }

    // Build the widget
    execSync('npm run build', { cwd: widgetPath, stdio: 'inherit' })

    console.log(`   ✅ ${widget} built successfully`)
    successCount++
  } catch (error) {
    console.error(`   ❌ ${widget} build failed:`, error.message)
    failCount++
  }
}

console.log('\\n' + '='.repeat(50))
console.log(`\\n📊 Build Summary:`)
console.log(`   ✅ Success: ${successCount}`)
console.log(`   ❌ Failed: ${failCount}`)
console.log(`   📦 Total: ${widgets.length}`)

if (failCount > 0) {
  console.log('\\n⚠️  Some builds failed. Check the errors above.')
  process.exit(1)
} else {
  console.log('\\n🎉 All widgets built successfully!\\n')
}
