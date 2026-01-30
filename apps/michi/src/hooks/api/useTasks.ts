/**
 * useTasks Hook - TanStack Query hooks for Tasks
 * Shinkofa Platform - Frontend
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '@/types/api'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '@/lib/api/tasks'

// ==================
// QUERY KEYS
// ==================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get all tasks (with optional filters)
 */
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single task by ID
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTask(taskId),
    enabled: !!taskId, // Only fetch if taskId exists
    staleTime: 5 * 60 * 1000,
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Create new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate all task queries to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

/**
 * Update existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) })

      // Snapshot previous value
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId))

      // Optimistically update to the new value
      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(taskId), {
          ...previousTask,
          ...input,
        })
      }

      return { previousTask }
    },
    onError: (_err, { taskId }, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask)
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

/**
 * Delete task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

/**
 * Toggle task completed status (helper mutation)
 */
export function useToggleTaskCompleted() {
  const updateTask = useUpdateTask()

  return {
    ...updateTask,
    mutate: (task: Task) => {
      updateTask.mutate({
        taskId: task.id,
        input: { completed: !task.completed },
      })
    },
  }
}
