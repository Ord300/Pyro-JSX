"use client";

import { useGallery } from "@/src/hooks/queries/gallery";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";

export default function Gallery() {
  const { data: galleryImages = [] } = useGallery();
  const visibleImages = galleryImages
    .filter((img) => img.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">Nos installations</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Galerie</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">
          Découvrez notre centre en images : {visibleImages.length} photo(s) de nos installations.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {visibleImages.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Aucune image dans la galerie pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleImages.map((img) => (
              <Card
                key={img.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800"
              >
                <img
                  src={img.image}
                  alt={img.alt || img.title}
                  className="h-52 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{img.title}</h3>
                  {img.alt && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{img.alt}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
