import { app } from 'electron'
import { existsSync, mkdirSync, createWriteStream, unlinkSync, readdirSync, renameSync, rmSync, createReadStream } from 'fs'
import { join } from 'path'
import { execSync, spawn } from 'child_process'
import https from 'https'
import { Extract } from 'unzipper'

export interface DependencyStatus {
  ffmpeg: {
    installed: boolean
    path: string | null
    version: string | null
  }
  scrcpy: {
    installed: boolean
    path: string | null
    version: string | null
  }
}

// URLs for Windows x64 binaries
const FFMPEG_URL = 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip'
const SCRCPY_URL = 'https://github.com/Genymobile/scrcpy/releases/download/v2.4/scrcpy-win64-v2.4.zip'

class DependenciesService {
  private _binPath: string | null = null

  private get binPath(): string {
    if (!this._binPath) {
      this._binPath = join(app.getPath('userData'), 'bin')
      this.ensureBinFolder()
    }
    return this._binPath
  }

  private ensureBinFolder(): void {
    if (this._binPath && !existsSync(this._binPath)) {
      mkdirSync(this._binPath, { recursive: true })
    }
  }

  get ffmpegPath(): string {
    return join(this.binPath, 'ffmpeg', 'ffmpeg.exe')
  }

  get scrcpyPath(): string {
    return join(this.binPath, 'scrcpy', 'scrcpy.exe')
  }

  get adbPath(): string {
    return join(this.binPath, 'scrcpy', 'adb.exe')
  }

  checkStatus(): DependencyStatus {
    const ffmpegInstalled = existsSync(this.ffmpegPath)
    const scrcpyInstalled = existsSync(this.scrcpyPath)

    console.log('[Dependencies] Check status:')
    console.log(`  FFmpeg path: ${this.ffmpegPath}`)
    console.log(`  FFmpeg installed: ${ffmpegInstalled}`)
    console.log(`  scrcpy path: ${this.scrcpyPath}`)
    console.log(`  scrcpy installed: ${scrcpyInstalled}`)

    return {
      ffmpeg: {
        installed: ffmpegInstalled,
        path: ffmpegInstalled ? this.ffmpegPath : null,
        version: this.getFFmpegVersion()
      },
      scrcpy: {
        installed: scrcpyInstalled,
        path: scrcpyInstalled ? this.scrcpyPath : null,
        version: this.getScrcpyVersion()
      }
    }
  }

  private getFFmpegVersion(): string | null {
    if (!existsSync(this.ffmpegPath)) return null
    try {
      const output = execSync(`"${this.ffmpegPath}" -version`, { encoding: 'utf-8' })
      const match = output.match(/ffmpeg version (\S+)/)
      return match ? match[1] : 'unknown'
    } catch {
      return null
    }
  }

  private getScrcpyVersion(): string | null {
    if (!existsSync(this.scrcpyPath)) return null
    try {
      const output = execSync(`"${this.scrcpyPath}" --version`, { encoding: 'utf-8' })
      const match = output.match(/scrcpy (\S+)/)
      return match ? match[1] : 'unknown'
    } catch {
      return null
    }
  }

  async downloadFFmpeg(onProgress?: (percent: number) => void): Promise<boolean> {
    if (existsSync(this.ffmpegPath)) {
      console.log('[Dependencies] FFmpeg already installed')
      return true
    }

    console.log('[Dependencies] Downloading FFmpeg...')
    const zipPath = join(this.binPath, 'ffmpeg.zip')
    const extractPath = join(this.binPath, 'ffmpeg-temp')
    const finalPath = join(this.binPath, 'ffmpeg')

    try {
      // Download
      await this.downloadFile(FFMPEG_URL, zipPath, onProgress)
      console.log('[Dependencies] FFmpeg downloaded, extracting...')

      // Extract
      if (!existsSync(extractPath)) {
        mkdirSync(extractPath, { recursive: true })
      }

      await this.extractZip(zipPath, extractPath)

      // Move bin folder contents to final location
      if (!existsSync(finalPath)) {
        mkdirSync(finalPath, { recursive: true })
      }

      // Find the bin folder inside extracted content
      const extractedDirs = readdirSync(extractPath)
      const ffmpegDir = extractedDirs.find(d => d.startsWith('ffmpeg-'))
      if (ffmpegDir) {
        const binDir = join(extractPath, ffmpegDir, 'bin')
        if (existsSync(binDir)) {
          const files = readdirSync(binDir)
          for (const file of files) {
            renameSync(join(binDir, file), join(finalPath, file))
          }
        }
      }

      // Cleanup
      unlinkSync(zipPath)
      rmSync(extractPath, { recursive: true, force: true })

      console.log('[Dependencies] FFmpeg installed successfully')
      return existsSync(this.ffmpegPath)
    } catch (error) {
      console.error('[Dependencies] FFmpeg download failed:', error)
      return false
    }
  }

  async downloadScrcpy(onProgress?: (percent: number) => void): Promise<boolean> {
    if (existsSync(this.scrcpyPath)) {
      console.log('[Dependencies] scrcpy already installed')
      return true
    }

    console.log('[Dependencies] Downloading scrcpy...')
    const zipPath = join(this.binPath, 'scrcpy.zip')
    const extractPath = join(this.binPath, 'scrcpy-temp')
    const finalPath = join(this.binPath, 'scrcpy')

    try {
      // Download
      await this.downloadFile(SCRCPY_URL, zipPath, onProgress)
      console.log('[Dependencies] scrcpy downloaded, extracting...')

      // Extract
      if (!existsSync(extractPath)) {
        mkdirSync(extractPath, { recursive: true })
      }

      await this.extractZip(zipPath, extractPath)

      // Move contents to final location
      if (!existsSync(finalPath)) {
        mkdirSync(finalPath, { recursive: true })
      }

      // Find the scrcpy folder inside extracted content
      const extractedDirs = readdirSync(extractPath)
      const scrcpyDir = extractedDirs.find(d => d.startsWith('scrcpy-'))
      if (scrcpyDir) {
        const srcDir = join(extractPath, scrcpyDir)
        const files = readdirSync(srcDir)
        for (const file of files) {
          renameSync(join(srcDir, file), join(finalPath, file))
        }
      }

      // Cleanup
      unlinkSync(zipPath)
      rmSync(extractPath, { recursive: true, force: true })

      console.log('[Dependencies] scrcpy installed successfully')
      return existsSync(this.scrcpyPath)
    } catch (error) {
      console.error('[Dependencies] scrcpy download failed:', error)
      return false
    }
  }

  private downloadFile(
    url: string,
    destPath: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(destPath)

      const request = (currentUrl: string): void => {
        https.get(currentUrl, (response) => {
          // Handle redirects
          if (response.statusCode === 302 || response.statusCode === 301) {
            const redirectUrl = response.headers.location
            if (redirectUrl) {
              request(redirectUrl)
              return
            }
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Download failed with status ${response.statusCode}`))
            return
          }

          const totalSize = parseInt(response.headers['content-length'] || '0', 10)
          let downloadedSize = 0

          response.on('data', (chunk: Buffer) => {
            downloadedSize += chunk.length
            if (onProgress && totalSize > 0) {
              onProgress(Math.round((downloadedSize / totalSize) * 100))
            }
          })

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            resolve()
          })
        }).on('error', (error) => {
          if (existsSync(destPath)) {
            unlinkSync(destPath)
          }
          reject(error)
        })
      }

      request(url)
    })
  }

  private extractZip(zipPath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(Extract({ path: destPath }))
        .on('close', resolve)
        .on('error', reject)
    })
  }

  // Check if ADB can detect devices
  async checkAdbDevices(): Promise<string[]> {
    if (!existsSync(this.adbPath)) return []

    return new Promise((resolve) => {
      const adb = spawn(this.adbPath, ['devices'], { windowsHide: true })
      let output = ''

      adb.stdout.on('data', (data) => {
        output += data.toString()
      })

      adb.on('close', () => {
        const lines = output.split('\n').slice(1) // Skip header
        const devices = lines
          .filter((line) => line.includes('device'))
          .map((line) => line.split('\t')[0].trim())
          .filter(Boolean)
        resolve(devices)
      })

      adb.on('error', () => {
        resolve([])
      })
    })
  }
}

// Singleton
export const dependenciesService = new DependenciesService()
