export interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  image: string;
  alt: string;
  order: number;
  visible: boolean;
}