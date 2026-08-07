import { useEffect } from 'react';

export function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | LearnSphere` : 'LearnSphere Online Course Registration';
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.append(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
  return null;
}
