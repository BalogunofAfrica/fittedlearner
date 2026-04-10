export type ContentKind = 'articles' | 'projects' | 'reading-notes';

export interface ContentEntry {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  body: string;
  kind: ContentKind;
  metadata: Record<string, string>;
}

interface ParsedFrontmatter {
  metadata: Record<string, string>;
  body: string;
}

const reservedMetadataFields = new Set([
  'slug',
  'title',
  'summary',
  'date',
  'tags',
]);

const contentSourceMap: Record<ContentKind, Record<string, string>> = {
  articles: import.meta.glob('../content/articles/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  projects: import.meta.glob('../content/projects/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  'reading-notes': import.meta.glob('../content/reading-notes/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
};

const cachedCollections = buildCollections();

function buildCollections() {
  const collections = {} as Record<ContentKind, ContentEntry[]>;
  (Object.keys(contentSourceMap) as ContentKind[]).forEach((kind) => {
    const entries = Object.entries(contentSourceMap[kind]).map(
      ([path, rawMarkdown]) => parseEntry(kind, path, rawMarkdown)
    );

    entries.sort((entryA, entryB) => {
      const timestampA = new Date(entryA.date).getTime();
      const timestampB = new Date(entryB.date).getTime();
      return timestampB - timestampA;
    });

    collections[kind] = entries;
  });

  return collections;
}

function parseEntry(kind: ContentKind, path: string, rawMarkdown: string): ContentEntry {
  const parsed = parseFrontmatter(rawMarkdown);
  const filename = path.split('/').at(-1)?.replace(/\.md$/u, '') ?? '';
  const slug = parsed.metadata.slug ?? filename;

  const metadata = Object.fromEntries(
    Object.entries(parsed.metadata).filter(
      ([key]) => !reservedMetadataFields.has(key)
    )
  );

  return {
    slug,
    kind,
    title: parsed.metadata.title ?? slugToTitle(slug),
    summary: parsed.metadata.summary ?? createFallbackSummary(parsed.body),
    date: parsed.metadata.date ?? '1970-01-01',
    tags: parseTags(parsed.metadata.tags),
    body: parsed.body,
    metadata,
  };
}

function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const normalized = markdown.replace(/\r\n/gu, '\n').trim();
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);

  if (!frontmatterMatch) {
    return {
      metadata: {},
      body: normalized,
    };
  }

  const [, frontmatter, contentBody] = frontmatterMatch;
  const metadata: Record<string, string> = {};

  frontmatter.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf(':');
    if (separatorIndex < 0) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    metadata[key] = stripWrappingQuotes(rawValue);
  });

  return {
    metadata,
    body: contentBody.trim(),
  };
}

function parseTags(rawTags: string | undefined) {
  if (!rawTags) {
    return [];
  }

  const normalizedTags = rawTags.replace(/^\[(.*)\]$/u, '$1');
  return normalizedTags
    .split(',')
    .map((tag) => stripWrappingQuotes(tag).trim())
    .filter(Boolean);
}

function stripWrappingQuotes(input: string) {
  return input.replace(/^['"]|['"]$/gu, '');
}

function slugToTitle(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createFallbackSummary(markdownBody: string) {
  const collapsed = markdownBody.replace(/\s+/gu, ' ').trim();
  return collapsed.slice(0, 160).trimEnd() + (collapsed.length > 160 ? '…' : '');
}

export function getCollection(kind: ContentKind) {
  return cachedCollections[kind];
}

export function getEntry(kind: ContentKind, slug: string) {
  return cachedCollections[kind].find((entry) => entry.slug === slug);
}

export function getLatestEntries(limit = 6) {
  return (Object.keys(cachedCollections) as ContentKind[])
    .flatMap((kind) => cachedCollections[kind])
    .sort((entryA, entryB) => {
      const timestampA = new Date(entryA.date).getTime();
      const timestampB = new Date(entryB.date).getTime();
      return timestampB - timestampA;
    })
    .slice(0, limit);
}
