#!/usr/bin/env node
/**
 * Deploy Widgets Script
 * Deploys built widgets to VPS via SSH/SCP
 * Cross-platform compatible (Windows + Unix)
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { execSync } from 'child_process'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, posix } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const widgetsDir = join(rootDir, 'widgets')

// Detect Windows
const isWindows = process.platform === 'win32'

// Convert Windows path to POSIX for scp
function toScpPath(localPath) {
  if (!isWindows) return localPath
  // Convert backslashes and handle drive letter
  return localPath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1')
}

// Configuration - Update these for your VPS
const VPS_HOST = process.env.VPS_HOST || 'tools.theermite.com'
const VPS_USER = process.env.VPS_USER || 'ubuntu'
const VPS_PATH = process.env.VPS_PATH || '/var/www/tools.theermite.com/widgets'

console.log('\\n🚀 Ermite Toolbox - Deploy Widgets\\n')
console.log('='.repeat(50))

// Check if running in CI or has VPS configured
if (VPS_HOST === 'your-vps.com') {
  console.log('\\n⚠️  VPS not configured!')
  console.log('   Set environment variables:')
  console.log('   - VPS_HOST: Your VPS hostname or IP')
  console.log('   - VPS_USER: SSH user (default: root)')
  console.log('   - VPS_PATH: Deployment path on VPS')
  console.log('\\n   Example:')
  console.log('   VPS_HOST=vps.theermite.com VPS_USER=root npm run deploy')
  process.exit(1)
}

// Get all widget directories with dist folders
const widgets = readdirSync(widgetsDir).filter(name => {
  const widgetPath = join(widgetsDir, name)
  const distPath = join(widgetPath, 'dist')
  return statSync(widgetPath).isDirectory() && existsSync(distPath)
})

if (widgets.length === 0) {
  console.log('\\n❌ No built widgets found!')
  console.log('   Run "npm run build" first.')
  process.exit(1)
}

console.log(`\\n📦 Deploying ${widgets.length} widget(s):\\n`)
widgets.forEach(w => console.log(`   - ${w}`))
console.log('')

let successCount = 0
let failCount = 0

for (const widget of widgets) {
  const distPath = join(widgetsDir, widget, 'dist')
  const remotePath = `${VPS_PATH}/${widget}`

  console.log(`\\n🔄 Deploying: ${widget}`)
  console.log('-'.repeat(40))

  try {
    // Create remote directory via SSH
    console.log(`   Creating remote directory...`)
    execSync(`ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${remotePath}"`, { stdio: 'inherit' })

    // Upload via SSH tar pipe (most reliable on Windows)
    console.log(`   Uploading files...`)
    if (isWindows) {
      // On Windows, use tar over SSH to avoid path conversion issues
      const tarCmd = `tar -C "${distPath}" -cf - . | ssh ${VPS_USER}@${VPS_HOST} "tar -C ${remotePath} -xf -"`
      execSync(tarCmd, { stdio: 'inherit', shell: 'bash' })
    } else {
      // On Unix, scp works fine
      execSync(`scp -r ${distPath}/. ${VPS_USER}@${VPS_HOST}:${remotePath}/`, { stdio: 'inherit' })
    }

    console.log(`   ✅ ${widget} deployed successfully`)
    successCount++
  } catch (error) {
    console.error(`   ❌ ${widget} deployment failed:`, error.message)
    failCount++
  }
}

console.log('\\n' + '='.repeat(50))
console.log(`\\n📊 Deployment Summary:`)
console.log(`   ✅ Success: ${successCount}`)
console.log(`   ❌ Failed: ${failCount}`)
console.log(`   📦 Total: ${widgets.length}`)

if (failCount > 0) {
  console.log('\\n⚠️  Some deployments failed. Check the errors above.')
  process.exit(1)
} else {
  console.log(`\\n🎉 All widgets deployed to ${VPS_HOST}!`)
  console.log(`\\n📍 Widgets available at:`)
  widgets.forEach(w => {
    console.log(`   https://tools.theermite.com/widgets/${w}/${w}.es.js`)
  })
  console.log('')
}
