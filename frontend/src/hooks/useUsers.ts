import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import type { UserUpdateData } from '../types'

export function useUsers() {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateData }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useUser(id: number) {
  const query = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}