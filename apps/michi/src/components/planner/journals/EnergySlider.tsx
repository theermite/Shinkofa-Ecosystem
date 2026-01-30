/**
 * EnergySlider Component - Energy level slider (0-10)
 * Shinkofa Platform - Frontend
 */

'use client'

import { useState } from 'react'

interface EnergySliderProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  label: string
  disabled?: boolean
}

const ENERGY_EMOJIS = [
  '😴', // 0
  '😪', // 1
  '😔', // 2
  '😕', // 3
  '😐', // 4
  '🙂', // 5
  '😊', // 6
  '😃', // 7
  '😄', // 8
  '🤩', // 9
  '⚡', // 10
]

const ENERGY_COLORS = [
  'from-gray-400 to-gray-500', // 0-1
  'from-red-400 to-red-500', // 2-3
  'from-orange-400 to-orange-500', // 4-5
  'from-yellow-400 to-yellow-500', // 6-7
  'from-green-400 to-green-500', // 8-9
  'from-emerald-400 to-emerald-500', // 10
]

function getEnergyColor(value: number): string {
  if (value <= 1) return ENERGY_COLORS[0]
  if (value <= 3) return ENERGY_COLORS[1]
  if (value <= 5) return ENERGY_COLORS[2]
  if (value <= 7) return ENERGY_COLORS[3]
  if (value <= 9) return ENERGY_COLORS[4]
  return ENERGY_COLORS[5]
}

export function EnergySlider({ value, onChange, onBlur, label, disabled = false }: EnergySliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (onBlur) onBlur()
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (onBlur) onBlur()
  }

  const handleQuickSelect = (quickValue: number) => {
    onChange(quickValue)
    if (onBlur) onBlur()
  }

  return (
    <div className="space-y-3">
      {/* Label & Value */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span
            className={`text-3xl transition-transform ${isDragging ? 'scale-125' : 'scale-100'}`}
            aria-hidden="true"
          >
            {ENERGY_EMOJIS[value]}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[3rem] text-right">
            {value}/10
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Filled Track (Gradient) */}
          <div
            className={`h-full bg-gradient-to-r ${getEnergyColor(value)} transition-all duration-200`}
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleMouseUp}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleTouchEnd}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`${value} sur 10`}
        />
      </div>

      {/* Quick Select Buttons */}
      <div className="flex gap-1 flex-wrap">
        {[0, 2, 4, 6, 8, 10].map((quickValue) => (
          <button
            key={quickValue}
            type="button"
            onClick={() => handleQuickSelect(quickValue)}
            disabled={disabled}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${
                value === quickValue
                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Définir l'énergie à ${quickValue}`}
          >
            {quickValue}
          </button>
        ))}
      </div>
    </div>
  )
}
