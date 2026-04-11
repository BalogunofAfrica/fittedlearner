import { Link } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import { PageHead } from '../components/page-head';
import { formatDate } from '../lib/date';
import {
  ContentEntry,
  PrimaryContentKind,
  getLatestPrimaryEntries,
  getPrimaryCollection,
  getProjectArticles,
  getProjectNotes,
  getReadingListNotes,
} from '../lib/content';

const primaryDetailRouteByKind: Record<
  PrimaryContentKind,
  '/articles/$slug' | '/projects/$slug' | '/reading-list/$slug'
> = {
  articles: '/articles/$slug',
  projects: '/projects/$slug',
  'reading-list': '/reading-list/$slug',
};

const collectionRouteByKind: Record<
  PrimaryContentKind,
  '/articles' | '/projects' | '/reading-list'
> = {
  articles: '/articles',
  projects: '/projects',
  'reading-list': '/reading-list',
};

const sectionTitleByKind: Record<PrimaryContentKind, string> = {
  articles: 'Articles',
  projects: 'Projects',
  'reading-list': 'Reading List',
};

const sectionTaglineByKind: Record<PrimaryContentKind, string> = {
  articles: 'Essays and practical notes from shipping work.',
  projects: 'Projects with links and optional build notes.',
  'reading-list': 'Books and resources, with optional notes per item.',
};

const singularTitleByKind: Record<PrimaryContentKind, string> = {
  articles: 'article',
  projects: 'project',
  'reading-list': 'reading list item',
};

interface HomeCollectionPreviewProps {
  kind: PrimaryContentKind;
  entries: ContentEntry[];
  ctaLabel: string;
}

interface DetailPageProps {
  entry: ContentEntry;
}

interface NoteDetailPageProps {
  parent: ContentEntry;
  note: ContentEntry;
}

type ParentWithNotesKind = 'projects' | 'reading-list';

interface NoteListProps {
  notes: ContentEntry[];
  parent: ContentEntry;
  parentKind: ParentWithNotesKind;
}

export function HomePage() {
  const latestEntries = getLatestPrimaryEntries(6);
  const projects = getPrimaryCollection('projects').slice(0, 3);
  const articles = getPrimaryCollection('articles').slice(0, 3);
  const readingList = getPrimaryCollection('reading-list').slice(0, 3);

  return (
    <div className='home-page'>
      <PageHead title='fitted learner' description='Learnings & Craft' />

      <section className='hero'>
        <p className='eyebrow'>Learnings & Crafts</p>
        <h1>Building products, leading teams, and learning in public.</h1>
        <p className='hero-copy'>
          Notes from hands-on product craft and technical leadership.
        </p>
      </section>

      <section className='home-section'>
        <div className='section-head'>
          <h2>Recent Work and Writing</h2>
        </div>
        <ul className='entry-grid'>
          {latestEntries.map((entry) => (
            <li key={`${entry.kind}-${entry.slug}`} className='entry-grid-item'>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      </section>

      <HomeCollectionPreview
        kind='projects'
        entries={projects}
        ctaLabel='Browse projects'
      />
      <HomeCollectionPreview
        kind='articles'
        entries={articles}
        ctaLabel='Browse articles'
      />
      <HomeCollectionPreview
        kind='reading-list'
        entries={readingList}
        ctaLabel='Browse reading list'
      />
    </div>
  );
}

function HomeCollectionPreview({ kind, entries, ctaLabel }: HomeCollectionPreviewProps) {
  return (
    <section className='home-section'>
      <div className='section-head'>
        <div>
          <p className='eyebrow'>{sectionTitleByKind[kind]}</p>
          <h2>{sectionTaglineByKind[kind]}</h2>
        </div>
        <Link to={collectionRouteByKind[kind]} className='inline-link'>
          {ctaLabel}
        </Link>
      </div>

      <ul className='entry-grid'>
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.slug}`} className='entry-grid-item'>
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function EntryCard({ entry }: { entry: ContentEntry }) {
  const kind = entry.kind as PrimaryContentKind;

  return (
    <article className='entry-card'>
      <p className='entry-meta'>
        {sectionTitleByKind[kind]} ·{' '}
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </p>
      <h3>
        <Link
          to={primaryDetailRouteByKind[kind]}
          params={{ slug: entry.slug }}
          className='entry-title-link'
          aria-label={`Read ${singularTitleByKind[kind]}: ${entry.title}`}
        >
          {entry.title}
        </Link>
      </h3>
      <p>{entry.summary}</p>
      <div className='entry-tags'>
        {entry.tags.map((tag) => (
          <span key={tag} className='entry-tag'>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function CollectionPage({ kind }: { kind: PrimaryContentKind }) {
  const entries = getPrimaryCollection(kind);

  return (
    <section className='collection-page'>
      <PageHead
        title={sectionTitleByKind[kind]}
        description={sectionTaglineByKind[kind]}
      />

      <p className='eyebrow'>{sectionTitleByKind[kind]}</p>
      <h1>{sectionTaglineByKind[kind]}</h1>
      <ul className='entry-grid'>
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.slug}`} className='entry-grid-item'>
            <EntryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotesList({ notes, parent, parentKind }: NoteListProps) {
  if (!notes.length) {
    return (
      <p className='note-empty'>
        No notes yet. Add a markdown file in the notes folder to attach one.
      </p>
    );
  }

  return (
    <ul className='note-list'>
      {notes.map((note) => (
        <li key={note.slug} className='note-item'>
          {parentKind === 'projects' ? (
            <Link
              to='/projects/$slug/notes/$noteSlug'
              params={{ slug: parent.slug, noteSlug: note.slug }}
              className='note-link'
              aria-label={`Open project note: ${note.title}`}
            >
              {note.title}
            </Link>
          ) : (
            <Link
              to='/reading-list/$slug/notes/$noteSlug'
              params={{ slug: parent.slug, noteSlug: note.slug }}
              className='note-link'
              aria-label={`Open reading note: ${note.title}`}
            >
              {note.title}
            </Link>
          )}
          <p>{note.summary}</p>
          <p className='note-date'>
            <time dateTime={note.date}>{formatDate(note.date)}</time>
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProjectArticlesList({ articles }: { articles: ContentEntry[] }) {
  if (!articles.length) {
    return <p className='note-empty'>No linked articles yet.</p>;
  }

  return (
    <ul className='note-list'>
      {articles.map((article) => (
        <li key={article.slug} className='note-item'>
          <Link
            to='/articles/$slug'
            params={{ slug: article.slug }}
            className='note-link'
            aria-label={`Open article: ${article.title}`}
          >
            {article.title}
          </Link>
          <p>{article.summary}</p>
          <p className='note-date'>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </p>
        </li>
      ))}
    </ul>
  );
}

function ItemDetailPage({ entry }: DetailPageProps) {
  const kind = entry.kind as PrimaryContentKind;
  const relatedLinks = getRelatedLinks(entry);
  const primaryLink = getPrimaryLink(entry);
  const displayMetadata = Object.entries(entry.metadata).filter(
    ([key, value]) => !isLikelyLink(value) && key !== 'status'
  );

  const notes =
    kind === 'projects'
      ? getProjectNotes(entry.slug)
      : kind === 'reading-list'
        ? getReadingListNotes(entry.slug)
        : [];
  const projectArticles = kind === 'projects' ? getProjectArticles(entry.slug) : [];

  const secondaryLinks = primaryLink
    ? relatedLinks.filter((link) => link.href !== primaryLink.href)
    : relatedLinks;

  return (
    <article className='detail-page'>
      <PageHead
        title={entry.title}
        description={entry.summary}
        type={kind === 'articles' ? 'article' : 'website'}
      />

      <p className='eyebrow'>{sectionTitleByKind[kind]}</p>
      <h1>{entry.title}</h1>
      <p className='detail-meta'>
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </p>

      <div className='detail-supporting'>
        <div className='entry-tags'>
          {entry.tags.map((tag) => (
            <span key={tag} className='entry-tag'>
              {tag}
            </span>
          ))}
        </div>

        {entry.metadata.status ? (
          <p className='status-pill'>Status: {entry.metadata.status}</p>
        ) : null}

        {displayMetadata.length ? (
          <dl className='metadata-grid'>
            {displayMetadata.map(([key, value]) => (
              <div key={key}>
                <dt>{readableMetadataKey(key)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {primaryLink ? (
          <a
            href={primaryLink.href}
            target='_blank'
            rel='noreferrer'
            className='detail-primary-link'
            aria-label={`${primaryLink.label} (opens in a new tab)`}
          >
            {primaryLink.label}
          </a>
        ) : kind === 'projects' ? (
          <p className='note-empty'>
            Add a `url`, `demo`, or `repo` link to this project.
          </p>
        ) : null}

        {secondaryLinks.length ? (
          <div className='detail-links'>
            {secondaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target='_blank'
                rel='noreferrer'
                aria-label={`${link.label} (opens in a new tab)`}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className='markdown-body'>
        <ReactMarkdown>{entry.body}</ReactMarkdown>
      </div>

      {(kind === 'projects' || kind === 'reading-list') && notes.length ? (
        <section className='note-section'>
          <h2>{kind === 'projects' ? 'Build Notes' : 'Reading Annotations'}</h2>
          <NotesList
            notes={notes}
            parent={entry}
            parentKind={kind as ParentWithNotesKind}
          />
        </section>
      ) : null}

      {kind === 'projects' ? (
        <section className='note-section'>
          <h2>Linked Articles</h2>
          <ProjectArticlesList articles={projectArticles} />
        </section>
      ) : null}

      <Link to={collectionRouteByKind[kind]} className='detail-back-link'>
        Back to {sectionTitleByKind[kind]}
      </Link>
    </article>
  );
}

function NoteDetailPage({ parent, note }: NoteDetailPageProps) {
  const parentKind = parent.kind as ParentWithNotesKind;
  const relatedLinks = getRelatedLinks(note);
  const displayMetadata = Object.entries(note.metadata).filter(
    ([, value]) => !isLikelyLink(value)
  );

  return (
    <article className='detail-page'>
      <PageHead
        title={`${note.title} — ${parent.title}`}
        description={note.summary}
        type='article'
      />

      <p className='eyebrow'>{sectionTitleByKind[parentKind]} · Note</p>
      <h1>{note.title}</h1>
      <p className='detail-meta'>
        <time dateTime={note.date}>{formatDate(note.date)}</time>
      </p>

      <p className='note-parent-line'>
        Attached to:{' '}
        {parentKind === 'projects' ? (
          <Link
            to='/projects/$slug'
            params={{ slug: parent.slug }}
            className='inline-link'
          >
            {parent.title}
          </Link>
        ) : (
          <Link
            to='/reading-list/$slug'
            params={{ slug: parent.slug }}
            className='inline-link'
          >
            {parent.title}
          </Link>
        )}
      </p>

      <div className='detail-supporting'>
        <div className='entry-tags'>
          {note.tags.map((tag) => (
            <span key={tag} className='entry-tag'>
              {tag}
            </span>
          ))}
        </div>

        {displayMetadata.length ? (
          <dl className='metadata-grid'>
            {displayMetadata.map(([key, value]) => (
              <div key={key}>
                <dt>{readableMetadataKey(key)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {relatedLinks.length ? (
          <div className='detail-links'>
            {relatedLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target='_blank'
                rel='noreferrer'
                aria-label={`${link.label} (opens in a new tab)`}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className='markdown-body'>
        <ReactMarkdown>{note.body}</ReactMarkdown>
      </div>

      {parentKind === 'projects' ? (
        <Link
          to='/projects/$slug'
          params={{ slug: parent.slug }}
          className='detail-back-link'
        >
          Back to {parent.title}
        </Link>
      ) : (
        <Link
          to='/reading-list/$slug'
          params={{ slug: parent.slug }}
          className='detail-back-link'
        >
          Back to {parent.title}
        </Link>
      )}
    </article>
  );
}

function getPrimaryLink(entry: ContentEntry) {
  const optionsByKind: Partial<Record<PrimaryContentKind, string[]>> = {
    projects: ['url', 'demo', 'repo'],
    'reading-list': ['url', 'source', 'buy'],
  };
  const labels: Record<string, string> = {
    url: entry.kind === 'projects' ? 'Visit project' : 'Open resource',
    demo: 'Live demo',
    repo: 'Repository',
    source: 'Source',
    buy: 'Buy book',
  };

  const keys = optionsByKind[entry.kind as PrimaryContentKind] ?? [];
  for (const key of keys) {
    const value = entry.metadata[key];
    if (value && isLikelyLink(value)) {
      return {
        label: labels[key] ?? 'Open link',
        href: value,
      };
    }
  }

  return null;
}

function getRelatedLinks(entry: ContentEntry) {
  const labels: Record<string, string> = {
    url: entry.kind === 'projects' ? 'Project URL' : 'Resource URL',
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
  return <CollectionPage kind='articles' />;
}

export function ProjectsPage() {
  return <CollectionPage kind='projects' />;
}

export function ReadingListPage() {
  return <CollectionPage kind='reading-list' />;
}

export function ArticleDetailPage({ entry }: DetailPageProps) {
  return <ItemDetailPage entry={entry} />;
}

export function ProjectDetailPage({ entry }: DetailPageProps) {
  return <ItemDetailPage entry={entry} />;
}

export function ReadingListDetailPage({ entry }: DetailPageProps) {
  return <ItemDetailPage entry={entry} />;
}

export function ProjectNoteDetailPage({ parent, note }: NoteDetailPageProps) {
  return <NoteDetailPage parent={parent} note={note} />;
}

export function ReadingListNoteDetailPage({ parent, note }: NoteDetailPageProps) {
  return <NoteDetailPage parent={parent} note={note} />;
}
