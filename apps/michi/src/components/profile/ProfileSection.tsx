/**
 * ProfileSection Component
 * Generic container for profile sections with consistent styling
 * Shinkofa Platform
 */

import React from 'react'

interface ProfileSectionProps {
  title: string
  icon: string
  gradient?: string
  children: React.ReactNode
  className?: string
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon,
  gradient = 'from-blue-500 to-purple-500',
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-3xl shadow-lg`}>
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

interface InfoCardProps {
  label: string
  value: string | number | React.ReactNode
  bgColor?: string
  textColor?: string
  icon?: string
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  bgColor = 'bg-gray-50 dark:bg-gray-900/50',
  textColor = 'text-gray-900 dark:text-white',
  icon,
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </p>
      <p className={`text-lg font-semibold ${textColor}`}>
        {value}
      </p>
    </div>
  )
}

interface DetailCardProps {
  title: string
  items: string[]
  icon?: string
  color?: 'green' | 'orange' | 'purple' | 'blue' | 'red' | 'yellow'
}

export const DetailCard: React.FC<DetailCardProps> = ({
  title,
  items,
  icon = '•',
  color = 'blue',
}) => {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      <h3 className={`font-semibold ${colorClasses[color].split(' ')[0]} mb-3 text-lg`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className={`${colorClasses[color].split(' ')[0]} mt-1`}>{icon}</span>
            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
