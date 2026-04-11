export type ContentKind =
  | 'articles'
  | 'projects'
  | 'reading-list'
  | 'project-notes'
  | 'reading-list-notes';

export type PrimaryContentKind = 'articles' | 'projects' | 'reading-list';

export interface ContentEntry {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  body: string;
  kind: ContentKind;
  metadata: Record<string, string>;
  parentSlug?: string;
}

interface ParsedFrontmatter {
  metadata: Record<string, string>;
  body: string;
}

interface PrimaryCollectionResult {
  entries: ContentEntry[];
  folderToSlug: Map<string, string>;
}

const reservedMetadataFields = new Set(['slug', 'title', 'summary', 'date', 'tags']);

const contentSourceMap: Record<ContentKind, Record<string, string>> = {
  articles: import.meta.glob('../content/articles/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  projects: import.meta.glob(
    ['../content/projects/*.md', '../content/projects/*/overview.md'],
    {
      eager: true,
      import: 'default',
      query: '?raw',
    }
  ) as Record<string, string>,
  'reading-list': import.meta.glob(
    ['../content/reading-list/*.md', '../content/reading-list/*/overview.md'],
    {
      eager: true,
      import: 'default',
      query: '?raw',
    }
  ) as Record<string, string>,
  'project-notes': import.meta.glob('../content/projects/*/notes/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  'reading-list-notes': import.meta.glob('../content/reading-list/*/notes/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
};

const primaryKinds: PrimaryContentKind[] = ['articles', 'projects', 'reading-list'];

const noteParentFieldByKind: Partial<Record<ContentKind, 'project' | 'item'>> = {
  'project-notes': 'project',
  'reading-list-notes': 'item',
};

const cachedCollections = buildCollections();

function buildCollections() {
  const articles = sortByDateDescending(
    Object.entries(contentSourceMap.articles).map(([path, rawMarkdown]) =>
      parseFlatEntry('articles', path, rawMarkdown)
    )
  );

  const projects = parsePrimaryCollection(
    'projects',
    contentSourceMap.projects,
    'projects'
  );
  const readingList = parsePrimaryCollection(
    'reading-list',
    contentSourceMap['reading-list'],
    'reading-list'
  );

  const projectNotes = sortByDateDescending(
    parseNestedNotesCollection(
      'project-notes',
      contentSourceMap['project-notes'],
      'projects',
      projects.folderToSlug
    )
  );
  const readingListNotes = sortByDateDescending(
    parseNestedNotesCollection(
      'reading-list-notes',
      contentSourceMap['reading-list-notes'],
      'reading-list',
      readingList.folderToSlug
    )
  );

  return {
    articles,
    projects: projects.entries,
    'reading-list': readingList.entries,
    'project-notes': projectNotes,
    'reading-list-notes': readingListNotes,
  } satisfies Record<ContentKind, ContentEntry[]>;
}

function parseFlatEntry(
  kind: ContentKind,
  path: string,
  rawMarkdown: string
): ContentEntry {
  const parsed = parseFrontmatter(rawMarkdown);
  const filename = path.split('/').at(-1)?.replace(/\.md$/u, '') ?? '';
  const slug = parsed.metadata.slug ?? filename;
  const metadata = extractDisplayMetadata(parsed.metadata);

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

function parsePrimaryCollection(
  kind: PrimaryContentKind,
  sourceMap: Record<string, string>,
  collectionFolder: 'projects' | 'reading-list'
): PrimaryCollectionResult {
  const nestedEntries: ContentEntry[] = [];
  const flatEntries: ContentEntry[] = [];
  const folderToSlug = new Map<string, string>();

  Object.entries(sourceMap).forEach(([path, rawMarkdown]) => {
    const parsed = parseFrontmatter(rawMarkdown);
    const pathInfo = parsePrimaryPathInfo(path, collectionFolder);
    const defaultSlug = pathInfo.folderSlug ?? pathInfo.fileSlug;
    const slug = parsed.metadata.slug ?? defaultSlug;

    if (pathInfo.folderSlug) {
      folderToSlug.set(pathInfo.folderSlug, slug);
    }

    const entry = {
      slug,
      kind,
      title: parsed.metadata.title ?? slugToTitle(slug),
      summary: parsed.metadata.summary ?? createFallbackSummary(parsed.body),
      date: parsed.metadata.date ?? '1970-01-01',
      tags: parseTags(parsed.metadata.tags),
      body: parsed.body,
      metadata: extractDisplayMetadata(parsed.metadata),
    } satisfies ContentEntry;

    if (pathInfo.isNested) {
      nestedEntries.push(entry);
      return;
    }

    flatEntries.push(entry);
  });

  // Prefer nested entries when both flat and nested files define the same slug.
  const deduped = new Map<string, ContentEntry>();
  nestedEntries.forEach((entry) => {
    deduped.set(entry.slug, entry);
  });
  flatEntries.forEach((entry) => {
    if (!deduped.has(entry.slug)) {
      deduped.set(entry.slug, entry);
    }
  });

  return {
    entries: sortByDateDescending([...deduped.values()]),
    folderToSlug,
  };
}

function parseNestedNotesCollection(
  kind: 'project-notes' | 'reading-list-notes',
  sourceMap: Record<string, string>,
  parentCollectionFolder: 'projects' | 'reading-list',
  folderToParentSlug: Map<string, string>
) {
  return Object.entries(sourceMap).map(([path, rawMarkdown]) => {
    const parsed = parseFrontmatter(rawMarkdown);
    const filename = path.split('/').at(-1)?.replace(/\.md$/u, '') ?? '';
    const slug = parsed.metadata.slug ?? filename;
    const folderSlug = getCollectionFolderSlug(path, parentCollectionFolder);
    const fallbackParentField = noteParentFieldByKind[kind];
    const fallbackParentSlug = fallbackParentField
      ? parsed.metadata[fallbackParentField]
      : undefined;
    const parentSlug =
      (folderSlug ? folderToParentSlug.get(folderSlug) : undefined) ??
      fallbackParentSlug ??
      folderSlug;

    const metadata = extractDisplayMetadata(parsed.metadata);
    if (fallbackParentField) {
      delete metadata[fallbackParentField];
    }

    return {
      slug,
      kind,
      title: parsed.metadata.title ?? slugToTitle(slug),
      summary: parsed.metadata.summary ?? createFallbackSummary(parsed.body),
      date: parsed.metadata.date ?? '1970-01-01',
      tags: parseTags(parsed.metadata.tags),
      body: parsed.body,
      metadata,
      parentSlug,
    } satisfies ContentEntry;
  });
}

function getCollectionFolderSlug(
  path: string,
  collectionFolder: 'projects' | 'reading-list'
) {
  const segments = path.split('/');
  const collectionIndex = segments.indexOf(collectionFolder);
  if (collectionIndex < 0) {
    return undefined;
  }

  return segments.at(collectionIndex + 1);
}

interface PrimaryPathInfo {
  fileSlug: string;
  folderSlug?: string;
  isNested: boolean;
}

function parsePrimaryPathInfo(
  path: string,
  collectionFolder: 'projects' | 'reading-list'
): PrimaryPathInfo {
  const segments = path.split('/');
  const collectionIndex = segments.indexOf(collectionFolder);
  const collectionChild = segments.at(collectionIndex + 1) ?? '';
  const nextSegment = segments.at(collectionIndex + 2) ?? '';

  if (nextSegment === 'overview.md') {
    return {
      fileSlug: collectionChild,
      folderSlug: collectionChild,
      isNested: true,
    };
  }

  return {
    fileSlug: collectionChild.replace(/\.md$/u, ''),
    isNested: false,
  };
}

function sortByDateDescending(entries: ContentEntry[]) {
  return [...entries].sort((entryA, entryB) => {
    const timestampA = new Date(entryA.date).getTime();
    const timestampB = new Date(entryB.date).getTime();
    return timestampB - timestampA;
  });
}

function extractDisplayMetadata(metadata: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !reservedMetadataFields.has(key))
  );
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

export function getPrimaryCollection(kind: PrimaryContentKind) {
  return cachedCollections[kind];
}

export function getPrimaryEntry(kind: PrimaryContentKind, slug: string) {
  return cachedCollections[kind].find((entry) => entry.slug === slug);
}

export function getProjectNotes(projectSlug: string) {
  return cachedCollections['project-notes'].filter(
    (note) => note.parentSlug === projectSlug
  );
}

export function getProjectArticles(projectSlug: string) {
  return cachedCollections.articles.filter(
    (article) => article.metadata.project === projectSlug
  );
}

export function getProjectNote(projectSlug: string, noteSlug: string) {
  return cachedCollections['project-notes'].find(
    (note) => note.parentSlug === projectSlug && note.slug === noteSlug
  );
}

export function getReadingListNotes(itemSlug: string) {
  return cachedCollections['reading-list-notes'].filter(
    (note) => note.parentSlug === itemSlug
  );
}

export function getReadingListNote(itemSlug: string, noteSlug: string) {
  return cachedCollections['reading-list-notes'].find(
    (note) => note.parentSlug === itemSlug && note.slug === noteSlug
  );
}

export function getLatestPrimaryEntries(limit = 6) {
  return primaryKinds
    .flatMap((kind) => cachedCollections[kind])
    .sort((entryA, entryB) => {
      const timestampA = new Date(entryA.date).getTime();
      const timestampB = new Date(entryB.date).getTime();
      return timestampB - timestampA;
    })
    .slice(0, limit);
}
