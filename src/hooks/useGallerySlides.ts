"use client";

import { useMemo } from "react";
import { useGallery } from "@/src/hooks/queries/gallery";

export type GallerySlide = { src: string; alt: string };

const FALLBACK_SLIDES: GallerySlide[] = [
  { src: "/hero-basket.jpg", alt: "Photo centre sportif 1" },
  { src: "/hero-yoga.jpg", alt: "Photo centre sportif 2" },
  { src: "/hero-basket-2.jpg", alt: "Photo centre sportif 3" },
  { src: "/equipe-aigles.jpg", alt: "Équipe Les Aigles du Congo" },
];

/**
 * Slides pour tous les carrousels publics (accueil, connexion, inscription, vérification).
 * Source unique : module admin Galerie (images visibles, triées par `order`).
 * Fallback vers les images par défaut si la galerie est vide / non chargée.
 */
export function useGallerySlides(): GallerySlide[] {
  const { data: gallery = [] } = useGallery();

  return useMemo(() => {
    const visible = [...gallery]
      .filter((g) => g.visible && g.image)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((g) => ({ src: g.image, alt: g.alt || g.title || "Photo du centre" }));
    return visible.length > 0 ? visible : FALLBACK_SLIDES;
  }, [gallery]);
}
