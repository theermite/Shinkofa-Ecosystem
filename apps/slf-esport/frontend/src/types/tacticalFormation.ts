/**
 * Tactical Formation types - TypeScript definitions
 */

export enum MapType {
  SUMMONERS_RIFT = 'summoners_rift',
  DOTA2 = 'dota2',
  GENERIC = 'generic',
  // Honor of Kings maps
  HOK_FULL = 'hok_full',
  HOK_TOP_LANE = 'hok_top_lane',
  HOK_MID_LANE = 'hok_mid_lane',
  HOK_BOT_LANE = 'hok_bot_lane',
  HOK_BLUE_BUFF = 'hok_blue_buff',
  HOK_RED_BUFF = 'hok_red_buff',
  HOK_DRAKE = 'hok_drake',
  HOK_LORD = 'hok_lord',
}

export enum FormationCategory {
  ENGAGE = 'engage',
  POKE = 'poke',
  SIEGE = 'siege',
  TEAMFIGHT = 'teamfight',
  ROTATION = 'rotation',
  DEFENSE = 'defense',
  SPLIT_PUSH = 'split_push',
}

export interface PlayerPosition {
  id: number
  role: string // 'top', 'jungle', 'mid', 'adc', 'support', 'enemy'
  x: number
  y: number
  color: string // 'blue' for team, 'red' for enemy
}

export interface DrawingElement {
  type: string // 'arrow', 'line', 'circle', 'rectangle', 'text'
  color: string
  properties: Record<string, any>
}

export interface TimelineFrame {
  time: number // milliseconds
  player_positions: Record<number, { x: number; y: number }>
}

export interface FormationData {
  players: PlayerPosition[]
  enemies: PlayerPosition[]
  drawings: DrawingElement[]
  timeline: TimelineFrame[]
}

export interface TacticalFormation {
  id: number
  name: string
  description?: string
  map_type: MapType
  formation_data: FormationData
  tags: string[]
  category?: FormationCategory
  created_by: number
  team_id?: number
  is_public: boolean
  shared_with: number[]
  created_at: string
  updated_at: string
  views_count: number
  likes_count: number
}

export interface TacticalFormationCreate {
  name: string
  description?: string
  map_type?: MapType
  formation_data: FormationData
  tags?: string[]
  category?: FormationCategory
  team_id?: number
}

export interface TacticalFormationUpdate {
  name?: string
  description?: string
  formation_data?: FormationData
  tags?: string[]
  category?: FormationCategory
}

export interface ShareFormationRequest {
  user_ids?: number[]
  team_id?: number
  make_public?: boolean
}
