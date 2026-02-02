export const TaskCategory = {
  WORK: 'WORK',
  PERSONAL: 'PERSONAL',
  SHOPPING: 'SHOPPING',
  HEALTH: 'HEALTH',
  FINANCE: 'FINANCE'
} as const

export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory]

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]
