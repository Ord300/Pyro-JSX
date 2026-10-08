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
    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

    const revealAll = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (!el.classList.contains('reveal-visible')) el.classList.add('reveal-visible');
      });
    };

    if (!('IntersectionObserver' in window)) {
      // Fallback : on affiche tout directement si l'API n'est pas supportée
      revealAll();
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

    const observeAll = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (!el.classList.contains('reveal-visible')) observer.observe(el);
      });
    };

    observeAll();

    // Les listes (produits, activités…) arrivent souvent après un fetch :
    // on observe aussi les éléments ajoutés dynamiquement au DOM.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(selector)) observer.observe(node);
            observeAll(node);
          }
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}