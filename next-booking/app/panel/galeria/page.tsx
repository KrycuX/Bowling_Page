'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useGallery, useUploadGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage } from '../../../hooks/panel/useGallery';
import type { GalleryImage } from '../../../hooks/panel/useGallery';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bowlinghub.pl';

export default function GalleryPage() {
  const { data: images, isLoading, isError, error } = useGallery();
  const uploadMutation = useUploadGalleryImage();
  const updateMutation = useUpdateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();

  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<GalleryImage | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    section: '',
    caption: '',
  });

  const [editForm, setEditForm] = useState({
    section: '',
    order: 0,
    caption: '',
  });

  const handleUpload = async () => {
    if (!uploadForm.file) return;

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    if (uploadForm.section) formData.append('section', uploadForm.section);
    if (uploadForm.caption) formData.append('caption', uploadForm.caption);

    try {
      await uploadMutation.mutateAsync(formData);
      setUploadDialog(false);
      setUploadForm({ file: null, section: '', caption: '' });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editDialog) return;

    try {
      await updateMutation.mutateAsync({
        id: editDialog.id,
        section: editForm.section || null,
        order: editForm.order,
        caption: editForm.caption || null,
      });
      setEditDialog(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      await deleteMutation.mutateAsync(deleteDialog);
      setDeleteDialog(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditDialog(image);
    setEditForm({
      section: image.section || '',
      order: image.order,
      caption: image.caption || '',
    });
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Zarządzanie galerią</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialog(true)}
        >
          Dodaj zdjęcie
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error">
          Nie udało się wczytać galerii. {error?.message}
        </Alert>
      )}

      {isLoading ? (
        <Typography>Ładowanie...</Typography>
      ) : (
        <Grid container spacing={2}>
          {images?.map((image) => {
            const imageUrl = image.url.startsWith('http')
              ? image.url
              : `${API_BASE}${image.url}`;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%',
                      overflow: 'hidden',
                      bgcolor: 'grey.200',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={image.caption || image.originalFilename}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="body2" noWrap>
                      {image.caption || image.originalFilename}
                    </Typography>
                    {image.section && (
                      <Typography variant="caption" color="text.secondary">
                        Sekcja: {image.section}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} mt={1}>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(image)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog(image.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj zdjęcie</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              type="file"
              inputProps={{ accept: 'image/jpeg,image/jpg,image/png,image/webp' }}
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  setUploadForm({ ...uploadForm, file });
                }
              }}
              fullWidth
            />
            <TextField
              label="Sekcja (opcjonalnie)"
              value={uploadForm.section}
              onChange={(e) => setUploadForm({ ...uploadForm, section: e.target.value })}
              fullWidth
              placeholder="np. main, bowling, karaoke"
            />
            <TextField
              label="Opis (opcjonalnie)"
              value={uploadForm.caption}
              onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Anuluj</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadForm.file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Wysyłanie...' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj zdjęcie</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Sekcja"
              value={editForm.section}
              onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
              fullWidth
              placeholder="Pozostaw puste aby usunąć sekcję"
            />
            <TextField
              label="Kolejność"
              type="number"
              value={editForm.order}
              onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Opis"
              value={editForm.caption}
              onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Anuluj</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Usunąć zdjęcie?</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć to zdjęcie? Tej operacji nie można cofnąć.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Anuluj</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

