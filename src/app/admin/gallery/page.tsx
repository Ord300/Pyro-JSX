"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { Badge } from "@/src/components/ui/Badge";
import { useGallery, useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage } from "@/src/hooks/queries/gallery";
import type { GalleryImage } from "@/src/types/gallery";

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({ title: "", alt: "", image: "", visible: true });

  const { data: galleryData = [] } = useGallery();
  const createImage = useCreateGalleryImage();
  const updateImage = useUpdateGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  useEffect(() => {
    setImages([...galleryData].sort((a, b) => a.order - b.order));
  }, [galleryData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", alt: "", image: "", visible: true });
    setIsModalOpen(true);
  };

  const openEdit = (img: GalleryImage) => {
    setEditItem(img);
    setForm({ title: img.title, alt: img.alt, image: img.image, visible: img.visible });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) return;
    if (editItem) {
      await updateImage.mutateAsync({ id: editItem.id, data: { ...form, order: editItem.order } });
    } else {
      const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.order)) : 0;
      await createImage.mutateAsync({ ...form, order: maxOrder + 1 });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette image ?")) return;
    await deleteImage.mutateAsync(id);
  };

  const toggleVisible = async (img: GalleryImage) => {
    await updateImage.mutateAsync({ id: img.id, data: { visible: !img.visible } });
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    // Mettre à jour les ordres
    const withOrders = updated.map((img, i) => ({ ...img, order: i + 1 }));
    setImages(withOrders);
    // Sauvegarder chaque image mise à jour
    for (const img of withOrders) {
      await updateImage.mutateAsync({ id: img.id, data: { order: img.order } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Galerie d'installations</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {images.filter((i) => i.visible).length} image(s) visible(s) sur {images.length} au total
          </p>
        </div>
        <Button onClick={openCreate} isLoading={createImage.isPending}>
          <Plus className="mr-2 h-4 w-4" />Ajouter une image
        </Button>
      </div>

      {/* Grille d'images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!img.visible ? "opacity-60" : ""}`}
          >
            <div className="relative">
              <img src={img.image} alt={img.alt || img.title} className="h-40 w-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => toggleVisible(img)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${img.visible ? "bg-green-500/80 text-white hover:bg-green-600" : "bg-slate-700/80 text-white hover:bg-slate-600"}`}
                  title={img.visible ? "Masquer" : "Afficher"}
                >
                  {img.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {!img.visible && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="default" className="text-xs bg-slate-800/80 text-white">Masquée</Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">{img.title}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{img.alt}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Monter"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="Descendre"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit(img)} isLoading={updateImage.isPending}>
                    <Edit2 className="mr-1 h-3 w-3" />Modifier
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDelete(img.id)} isLoading={deleteImage.isPending}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Aucune image dans la galerie.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />Ajouter la première image
          </Button>
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier l'image" : "Ajouter une image"} className="max-w-xl">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titre</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Salle de musculation" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Texte alternatif (alt)</label>
            <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Description de l'image" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
                reader.readAsDataURL(file);
              }}
              className="block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300"
            />
            {form.image && (
              <img src={form.image} alt="Aperçu" className="mt-2 h-40 w-full rounded-lg object-cover" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="visible"
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="visible" className="text-sm text-slate-600 dark:text-slate-400">Visible sur la page d'accueil</label>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button className="flex-1" onClick={handleSave} isLoading={editItem ? updateImage.isPending : createImage.isPending} disabled={!form.title || !form.image}>
            {editItem ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}