import { useEffect } from 'react';

/**
 * Hook qui ajoute automatiquement la classe `reveal-visible` aux éléments
 * portant les classes `reveal`, `reveal-left`, `reveal-right` ou `reveal-scale`
 * lorsqu'ils entrent dans le viewport (défilement de l'utilisateur).
 *
 * Usage : appeler `useScrollReveal()` dans un composant, puis ajouter
 * la classe `reveal` (ou variantes) sur les éléments à animer.
 */
export function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    if (!('IntersectionObserver' in window)) {
      // Fallback : on affiche tout directement si l'API n'est pas supportée
      targets.forEach((el) => el.classList.add('reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            // On peut arrêter d'observer une fois l'animation jouée
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}