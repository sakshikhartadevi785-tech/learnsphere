export function PageHero({ eyebrow, title, children, image, imageAlt = '' }) {
  if (image) {
    return (
      <section className="page-hero image-hero">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div>
        <img src={image} alt={imageAlt} />
      </section>
    );
  }
  return <section className="page-hero compact"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></section>;
}
