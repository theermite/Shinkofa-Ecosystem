/**
 * useProjects Hook - TanStack Query hooks for Projects
 * Shinkofa Platform - Frontend
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
} from '@/types/api'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/api/projects'
import { taskKeys } from './useTasks' // To invalidate tasks when project deleted

// ==================
// QUERY KEYS
// ==================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get all projects (with optional filters)
 */
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Create new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Update existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
      updateProject(projectId, input),
    onMutate: async ({ projectId, input }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) })

      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId)
      )

      if (previousProject) {
        queryClient.setQueryData<Project>(projectKeys.detail(projectId), {
          ...previousProject,
          ...input,
        })
      }

      return { previousProject }
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previousProject)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Delete project (cascades to tasks)
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate projects AND tasks (cascade delete)
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
