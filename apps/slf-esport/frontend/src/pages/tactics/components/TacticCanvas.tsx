/**
 * Tactic Canvas - Main canvas component for tactical board
 * Uses Konva.js for drag & drop and drawing
 */

import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Text, Line, Image as KonvaImage } from 'react-konva'
import type { PlayerPosition, FormationData, MapType } from '@/types/tacticalFormation'
import Konva from 'konva'

interface TacticCanvasProps {
  formationData: FormationData
  onFormationChange: (data: FormationData) => void
  mapType?: MapType
  canvasWidth?: number
  canvasHeight?: number
  readonly?: boolean
  visiblePlayerRoles?: string[]
  visibleEnemyRoles?: string[]
}

// Map type to image file mapping
const MAP_IMAGES: Record<string, string> = {
  hok_full: '/maps/Map-HOK-Janv2026.jpg',
  hok_top_lane: '/maps/Map-HOK-TopLane.jpg',
  hok_mid_lane: '/maps/Map-HOK-MidLane.jpg',
  hok_bot_lane: '/maps/Map-HOK-BotLane.jpg',
  hok_blue_buff: '/maps/Map-HOK-BlueBuff.jpg',
  hok_red_buff: '/maps/Map-HOK-RedBuff.jpg',
  hok_drake: '/maps/Map-HOK-Drake.jpg',
  hok_lord: '/maps/Map-HOK-Lord.jpg',
}

// Get emoji for each role
const getRoleEmoji = (role: string): string => {
  const roleLower = role.toLowerCase()

  if (roleLower === 'top' || roleLower.includes('clash')) {
    return '⚔️'
  } else if (roleLower === 'jungle' || roleLower === 'jung') {
    return '🌲'
  } else if (roleLower === 'mid' || roleLower === 'middle') {
    return '⚡'
  } else if (roleLower === 'adc' || roleLower === 'marksman') {
    return '🏹'
  } else if (roleLower === 'support' || roleLower === 'supp' || roleLower === 'roam') {
    return '🛡️'
  }

  return '⭐' // Default
}

const TacticCanvas: React.FC<TacticCanvasProps> = ({
  formationData,
  onFormationChange,
  mapType = 'generic' as MapType,
  canvasWidth = 800,
  canvasHeight = 800,
  readonly = false,
  visiblePlayerRoles = ['top', 'jungle', 'mid', 'adc', 'support'],
  visibleEnemyRoles = ['top', 'jungle', 'mid', 'adc', 'support'],
}) => {
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const gridSize = 40 // Grid cell size in pixels
  const numCols = Math.floor(canvasWidth / gridSize)
  const numRows = Math.floor(canvasHeight / gridSize)
  const showGrid = mapType === 'generic' // Only show grid for generic map

  // Load map image when mapType changes
  useEffect(() => {
    const imagePath = MAP_IMAGES[mapType as string]
    if (!imagePath) {
      setMapImage(null)
      setIsLoadingImage(false)
      return
    }

    setIsLoadingImage(true)
    const img = new window.Image()
    img.src = imagePath
    img.onload = () => {
      setMapImage(img)
      setIsLoadingImage(false)
    }
    img.onerror = () => {
      console.error(`Failed to load map image: ${imagePath}`)
      setMapImage(null)
      setIsLoadingImage(false)
    }
  }, [mapType])

  // Render grid lines
  const renderGrid = () => {
    const lines = []

    // Vertical lines
    for (let i = 0; i <= numCols; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasHeight]}
          stroke="#333"
          strokeWidth={i % 5 === 0 ? 2 : 1}
          opacity={0.3}
        />
      )
    }

    // Horizontal lines
    for (let i = 0; i <= numRows; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, canvasWidth, i * gridSize]}
          stroke="#333"
          strokeWidth={i % 5 === 0 ? 2 : 1}
          opacity={0.3}
        />
      )
    }

    return lines
  }

  // Handle player drag
  const handlePlayerDragEnd = (playerId: number, isEnemy: boolean, e: Konva.KonvaEventObject<DragEvent>) => {
    if (readonly) return

    const pos = e.target.position()

    // Update player position in formation data
    if (isEnemy) {
      const updatedEnemies = formationData.enemies.map((enemy) =>
        enemy.id === playerId ? { ...enemy, x: pos.x, y: pos.y } : enemy
      )
      onFormationChange({
        ...formationData,
        enemies: updatedEnemies,
      })
    } else {
      const updatedPlayers = formationData.players.map((player) =>
        player.id === playerId ? { ...player, x: pos.x, y: pos.y } : player
      )
      onFormationChange({
        ...formationData,
        players: updatedPlayers,
      })
    }
  }

  return (
    <div className="border-2 border-gray-700 rounded-lg overflow-hidden bg-gray-900 relative">
      {/* Loading spinner for map image */}
      {isLoadingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-white text-sm">Chargement de la carte...</p>
          </div>
        </div>
      )}

      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          {/* Background - Map image or solid color */}
          {mapImage ? (
            <KonvaImage
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              image={mapImage}
            />
          ) : (
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#1a1a1a" />
          )}

          {/* Grid (only for generic map) */}
          {showGrid && renderGrid()}

          {/* Zone labels (only for generic map) */}
          {showGrid && (
            <>
              <Text
                x={canvasWidth / 2 - 50}
                y={gridSize}
                text="TOP"
                fontSize={24}
                fill="#4ade80"
                fontStyle="bold"
              />
              <Text
                x={canvasWidth / 2 - 50}
                y={canvasHeight / 2 - 12}
                text="MID"
                fontSize={24}
                fill="#4ade80"
                fontStyle="bold"
              />
              <Text
                x={canvasWidth / 2 - 50}
                y={canvasHeight - gridSize * 2}
                text="BOT"
                fontSize={24}
                fill="#4ade80"
                fontStyle="bold"
              />
            </>
          )}

          {/* Team Players (Blue) */}
          {formationData.players
            .filter((player) => visiblePlayerRoles.includes(player.role.toLowerCase()))
            .map((player) => {
              const emoji = getRoleEmoji(player.role)

              return (
                <React.Fragment key={`player-${player.id}`}>
                  {/* Blue circle outline */}
                  <Circle
                    x={player.x}
                    y={player.y}
                    radius={18}
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fill="rgba(59, 130, 246, 0.2)"
                    shadowColor="#3b82f6"
                    shadowBlur={20}
                    shadowOpacity={0.8}
                    draggable={!readonly}
                    onDragEnd={(e) => handlePlayerDragEnd(player.id, false, e)}
                  />
                  {/* Emoji */}
                  <Text
                    x={player.x}
                    y={player.y}
                    text={emoji}
                    fontSize={32}
                    fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
                    align="center"
                    verticalAlign="middle"
                    offsetX={16}
                    offsetY={16}
                    listening={false}
                  />
                </React.Fragment>
              )
            })}

          {/* Enemy Players (Red) */}
          {formationData.enemies
            .filter((enemy) => {
              // Map enemy roles to standard roles
              const enemyRole = enemy.role.toLowerCase()
              if (enemyRole === 'enemy') {
                // If enemy doesn't have a specific role, show it if any role is visible
                return visibleEnemyRoles.length > 0
              }
              return visibleEnemyRoles.includes(enemyRole)
            })
            .map((enemy) => {
              // For enemies with 'enemy' role, cycle through roles based on ID
              const roles = ['top', 'jungle', 'mid', 'adc', 'support']
              const enemyRole = enemy.role.toLowerCase() === 'enemy'
                ? roles[(enemy.id - 1) % roles.length]
                : enemy.role.toLowerCase()

              const emoji = getRoleEmoji(enemyRole)

              return (
                <React.Fragment key={`enemy-${enemy.id}`}>
                  {/* Red circle outline */}
                  <Circle
                    x={enemy.x}
                    y={enemy.y}
                    radius={18}
                    stroke="#ef4444"
                    strokeWidth={4}
                    fill="rgba(239, 68, 68, 0.2)"
                    shadowColor="#ef4444"
                    shadowBlur={20}
                    shadowOpacity={0.8}
                    draggable={!readonly}
                    onDragEnd={(e) => handlePlayerDragEnd(enemy.id, true, e)}
                  />
                  {/* Emoji */}
                  <Text
                    x={enemy.x}
                    y={enemy.y}
                    text={emoji}
                    fontSize={32}
                    fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
                    align="center"
                    verticalAlign="middle"
                    offsetX={16}
                    offsetY={16}
                    listening={false}
                  />
                </React.Fragment>
              )
            })}
        </Layer>
      </Stage>
    </div>
  )
}

export default TacticCanvas
