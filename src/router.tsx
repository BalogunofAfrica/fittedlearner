import {
  Link,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from '@tanstack/react-router';
import {
  getPrimaryEntry,
  getProjectNote,
  getReadingListNote,
} from './lib/content';
import { RootLayout } from './views/root-layout';
import {
  ArticleDetailPage,
  ArticlesPage,
  HomePage,
  ProjectNoteDetailPage,
  ProjectDetailPage,
  ProjectsPage,
  ReadingListDetailPage,
  ReadingListNoteDetailPage,
  ReadingListPage,
} from './views/pages';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section className="detail-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>That page does not exist, but we can get you back on track.</p>
      <Link to="/" className="detail-back-link">
        Back home
      </Link>
    </section>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const articlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  component: ArticlesPage,
});

const articleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles/$slug',
  loader: ({ params }) => {
    const article = getPrimaryEntry('articles', params.slug);
    if (!article) {
      throw notFound();
    }

    return article;
  },
  component: ArticleDetailRouteComponent,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$slug',
  loader: ({ params }) => {
    const project = getPrimaryEntry('projects', params.slug);
    if (!project) {
      throw notFound();
    }

    return project;
  },
  component: ProjectDetailRouteComponent,
});

const projectNoteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$slug/notes/$noteSlug',
  loader: ({ params }) => {
    const project = getPrimaryEntry('projects', params.slug);
    const note = getProjectNote(params.slug, params.noteSlug);
    if (!project || !note) {
      throw notFound();
    }

    return {
      project,
      note,
    };
  },
  component: ProjectNoteDetailRouteComponent,
});

const readingListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reading-list',
  component: ReadingListPage,
});

const readingListDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reading-list/$slug',
  loader: ({ params }) => {
    const entry = getPrimaryEntry('reading-list', params.slug);
    if (!entry) {
      throw notFound();
    }

    return entry;
  },
  component: ReadingListDetailRouteComponent,
});

const readingListNoteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reading-list/$slug/notes/$noteSlug',
  loader: ({ params }) => {
    const item = getPrimaryEntry('reading-list', params.slug);
    const note = getReadingListNote(params.slug, params.noteSlug);
    if (!item || !note) {
      throw notFound();
    }

    return {
      item,
      note,
    };
  },
  component: ReadingListNoteDetailRouteComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  articlesRoute,
  articleDetailRoute,
  projectsRoute,
  projectDetailRoute,
  projectNoteDetailRoute,
  readingListRoute,
  readingListDetailRoute,
  readingListNoteDetailRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

function ArticleDetailRouteComponent() {
  const article = articleDetailRoute.useLoaderData();
  return <ArticleDetailPage entry={article} />;
}

function ProjectDetailRouteComponent() {
  const project = projectDetailRoute.useLoaderData();
  return <ProjectDetailPage entry={project} />;
}

function ProjectNoteDetailRouteComponent() {
  const data = projectNoteDetailRoute.useLoaderData();
  return <ProjectNoteDetailPage parent={data.project} note={data.note} />;
}

function ReadingListDetailRouteComponent() {
  const entry = readingListDetailRoute.useLoaderData();
  return <ReadingListDetailPage entry={entry} />;
}

function ReadingListNoteDetailRouteComponent() {
  const data = readingListNoteDetailRoute.useLoaderData();
  return <ReadingListNoteDetailPage parent={data.item} note={data.note} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
