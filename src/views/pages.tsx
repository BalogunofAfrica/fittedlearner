import { Link } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '../lib/date';
import { ContentEntry, ContentKind, getCollection, getLatestEntries } from '../lib/content';

const detailRouteByKind: Record<ContentKind, '/articles/$slug' | '/projects/$slug' | '/reading-notes/$slug'> = {
  articles: '/articles/$slug',
  projects: '/projects/$slug',
  'reading-notes': '/reading-notes/$slug',
};

const collectionRouteByKind: Record<ContentKind, '/articles' | '/projects' | '/reading-notes'> = {
  articles: '/articles',
  projects: '/projects',
  'reading-notes': '/reading-notes',
};

const sectionTitleByKind: Record<ContentKind, string> = {
  articles: 'Articles',
  projects: 'Projects',
  'reading-notes': 'Reading Notes',
};

const singularTitleByKind: Record<ContentKind, string> = {
  articles: 'article',
  projects: 'project',
  'reading-notes': 'reading note',
};

const sectionTaglineByKind: Record<ContentKind, string> = {
  articles: 'Essays and practical notes from shipping work.',
  projects: 'Selected builds with outcomes and lessons.',
  'reading-notes': 'Short takes from books and long-form writing.',
};

export function HomePage() {
  const latestEntries = getLatestEntries(6);
  const projects = getCollection('projects').slice(0, 3);
  const articles = getCollection('articles').slice(0, 3);
  const readingNotes = getCollection('reading-notes').slice(0, 3);

  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Personal Blog</p>
        <h1>Calm corner for projects, ideas, and reading reflections.</h1>
        <p className="hero-copy">
          A minimalist writing space inspired by Japanese editorial aesthetics. Add
          new content by dropping markdown files into one of three content folders.
        </p>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Latest updates</h2>
        </div>
        <ul className="entry-grid">
          {latestEntries.map((entry) => (
            <li key={`${entry.kind}-${entry.slug}`} className="entry-grid-item">
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      </section>

      <HomeCollectionPreview
        kind="projects"
        entries={projects}
        ctaLabel="View all projects"
      />
      <HomeCollectionPreview
        kind="articles"
        entries={articles}
        ctaLabel="View all articles"
      />
      <HomeCollectionPreview
        kind="reading-notes"
        entries={readingNotes}
        ctaLabel="View all reading notes"
      />
    </div>
  );
}

interface HomeCollectionPreviewProps {
  kind: ContentKind;
  entries: ContentEntry[];
  ctaLabel: string;
}

function HomeCollectionPreview({ kind, entries, ctaLabel }: HomeCollectionPreviewProps) {
  return (
    <section className="home-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{sectionTitleByKind[kind]}</p>
          <h2>{sectionTaglineByKind[kind]}</h2>
        </div>
        <Link to={collectionRouteByKind[kind]} className="inline-link">
          {ctaLabel}
        </Link>
      </div>

      <ul className="entry-grid">
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.slug}`} className="entry-grid-item">
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function EntryCard({ entry }: { entry: ContentEntry }) {
  return (
    <article className="entry-card">
      <p className="entry-meta">
        {sectionTitleByKind[entry.kind]} ·{' '}
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </p>
      <h3>
        <Link
          to={detailRouteByKind[entry.kind]}
          params={{ slug: entry.slug }}
          className="entry-title-link"
          aria-label={`Read ${singularTitleByKind[entry.kind]}: ${entry.title}`}
        >
          {entry.title}
        </Link>
      </h3>
      <p>{entry.summary}</p>
      <div className="entry-tags">
        {entry.tags.map((tag) => (
          <span key={tag} className="entry-tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

interface CollectionPageProps {
  kind: ContentKind;
}

function CollectionPage({ kind }: CollectionPageProps) {
  const entries = getCollection(kind);

  return (
    <section className="collection-page">
      <p className="eyebrow">{sectionTitleByKind[kind]}</p>
      <h1>{sectionTaglineByKind[kind]}</h1>
      <ul className="entry-grid">
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.slug}`} className="entry-grid-item">
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface EntryDetailPageProps {
  entry: ContentEntry;
}

function EntryDetail({ entry }: EntryDetailPageProps) {
  const relatedLinks = getRelatedLinks(entry);
  const displayMetadata = Object.entries(entry.metadata).filter(
    ([key, value]) => !isLikelyLink(value) && key !== 'status'
  );

  return (
    <article className="detail-page">
      <p className="eyebrow">{sectionTitleByKind[entry.kind]}</p>
      <h1>{entry.title}</h1>
      <p className="detail-meta">
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </p>

      <div className="detail-supporting">
        <div className="entry-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="entry-tag">
              {tag}
            </span>
          ))}
        </div>

        {entry.metadata.status ? (
          <p className="status-pill">Status: {entry.metadata.status}</p>
        ) : null}

        {displayMetadata.length ? (
          <dl className="metadata-grid">
            {displayMetadata.map(([key, value]) => (
              <div key={key}>
                <dt>{readableMetadataKey(key)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {relatedLinks.length ? (
          <div className="detail-links">
            {relatedLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label} (opens in a new tab)`}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="markdown-body">
        <ReactMarkdown>{entry.body}</ReactMarkdown>
      </div>

      <Link to={collectionRouteByKind[entry.kind]} className="detail-back-link">
        Back to {sectionTitleByKind[entry.kind]}
      </Link>
    </article>
  );
}

function getRelatedLinks(entry: ContentEntry) {
  const labels: Record<string, string> = {
    repo: 'Repository',
    demo: 'Live demo',
    source: 'Source',
    buy: 'Buy book',
  };

  return Object.entries(entry.metadata)
    .filter(([key, value]) => labels[key] && isLikelyLink(value))
    .map(([key, value]) => ({
      label: labels[key],
      href: value,
    }));
}

function isLikelyLink(value: string) {
  return /^https?:\/\//u.test(value);
}

function readableMetadataKey(key: string) {
  return key
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ArticlesPage() {
  return <CollectionPage kind="articles" />;
}

export function ProjectsPage() {
  return <CollectionPage kind="projects" />;
}

export function ReadingNotesPage() {
  return <CollectionPage kind="reading-notes" />;
}

export function ArticleDetailPage({ entry }: EntryDetailPageProps) {
  return <EntryDetail entry={entry} />;
}

export function ProjectDetailPage({ entry }: EntryDetailPageProps) {
  return <EntryDetail entry={entry} />;
}

export function ReadingDetailPage({ entry }: EntryDetailPageProps) {
  return <EntryDetail entry={entry} />;
}
