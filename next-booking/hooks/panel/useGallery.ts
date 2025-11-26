import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

export type GalleryImage = {
  id: number;
  filename: string;
  originalFilename: string;
  path: string;
  url: string;
  section: string | null;
  order: number;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateGalleryImageInput = {
  section?: string | null;
  order?: number;
  caption?: string | null;
};

export function useGallery() {
  return useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      return apiFetch<GalleryImage[]>('/admin/gallery');
    },
  });
}

export function useUploadGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return apiFetch<GalleryImage>('/admin/gallery', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gallery'] }),
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateGalleryImageInput) => {
      return apiFetch<GalleryImage>(`/admin/gallery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gallery'] }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/admin/gallery/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gallery'] }),
  });
}

