import { useEffect } from 'react';

const SITE_NAME = 'Fitted Learner';
const DEFAULT_IMAGE_PATH = '/og-image.png';

interface PageHeadProps {
  title: string;
  description: string;
  imagePath?: string;
  type?: 'website' | 'article';
}

export function PageHead({
  title,
  description,
  imagePath = DEFAULT_IMAGE_PATH,
  type = 'website',
}: PageHeadProps) {
  const pageTitle = title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`;

  useEffect(() => {
    document.title = pageTitle;
    upsertMeta({ name: 'description' }, description);

    upsertMeta({ property: 'og:title' }, pageTitle);
    upsertMeta({ property: 'og:description' }, description);
    upsertMeta({ property: 'og:type' }, type);
    upsertMeta({ property: 'og:image' }, imagePath);
    upsertMeta({ property: 'og:image:type' }, 'image/png');
    upsertMeta({ property: 'og:image:width' }, '1200');
    upsertMeta({ property: 'og:image:height' }, '630');
    upsertMeta(
      { property: 'og:image:alt' },
      'Fitted Learner social image with Japanese logo mark 文'
    );

    upsertMeta({ name: 'twitter:card' }, 'summary_large_image');
    upsertMeta({ name: 'twitter:title' }, pageTitle);
    upsertMeta({ name: 'twitter:description' }, description);
    upsertMeta({ name: 'twitter:image' }, imagePath);
  }, [description, imagePath, pageTitle, type]);

  return null;
}

function upsertMeta(selector: { name?: string; property?: string }, content: string) {
  const query = selector.name
    ? `meta[name="${selector.name}"]`
    : `meta[property="${selector.property}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(query);

  if (!tag) {
    tag = document.createElement('meta');
    if (selector.name) {
      tag.setAttribute('name', selector.name);
    }
    if (selector.property) {
      tag.setAttribute('property', selector.property);
    }
    document.head.append(tag);
  }

  tag.setAttribute('content', content);
}
