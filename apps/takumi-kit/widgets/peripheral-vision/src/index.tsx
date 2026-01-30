/**
 * PeripheralVision - Web Component Entry Point
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { PeripheralVision } from './PeripheralVision'
import { configureAPI } from '../../../shared/api/client'
import { generateCSSVariables, ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore } from '../../../shared/types'

class ErmitePeripheralVision extends HTMLElement {
  private root: Root | null = null
  private mountPoint: HTMLDivElement | null = null

  static get observedAttributes() {
    return ['user-id', 'difficulty', 'api-endpoint', 'auto-submit', 'rounds']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }

  attributeChangedCallback() {
    if (this.root) this.render()
  }

  private getProps() {
    return {
      userId: this.getAttribute('user-id') || undefined,
      difficulty: (this.getAttribute('difficulty') || 'medium') as DifficultyLevel,
      autoSubmitScore: this.getAttribute('auto-submit') !== 'false',
      totalRounds: parseInt(this.getAttribute('rounds') || '10', 10),
    }
  }

  private render() {
    if (!this.shadowRoot) return

    const apiEndpoint = this.getAttribute('api-endpoint')
    if (apiEndpoint) configureAPI({ baseUrl: apiEndpoint })

    const styles = document.createElement('style')
    styles.textContent = `
      ${generateCSSVariables(ermiteTheme)}
      :host { display: block; width: 100%; height: 100%; min-height: 500px; }
      .widget-container { width: 100%; height: 100%; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
    `

    this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(styles)

    this.mountPoint = document.createElement('div')
    this.mountPoint.className = 'widget-container'
    this.shadowRoot.appendChild(this.mountPoint)

    const props = this.getProps()

    const handleComplete = (score: WidgetScore) => {
      this.dispatchEvent(new CustomEvent('complete', { detail: score, bubbles: true, composed: true }))
    }
    const handleProgress = (progress: unknown) => {
      this.dispatchEvent(new CustomEvent('progress', { detail: progress, bubbles: true, composed: true }))
    }
    const handleError = (error: Error) => {
      this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message }, bubbles: true, composed: true }))
    }

    if (!this.root) this.root = createRoot(this.mountPoint)

    this.root.render(
      React.createElement(PeripheralVision, {
        ...props,
        onComplete: handleComplete,
        onProgress: handleProgress,
        onError: handleError,
      })
    )
  }
}

if (!customElements.get('ermite-peripheral-vision')) {
  customElements.define('ermite-peripheral-vision', ErmitePeripheralVision)
}

export { PeripheralVision } from './PeripheralVision'
export default ErmitePeripheralVision
