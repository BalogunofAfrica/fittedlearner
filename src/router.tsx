import {
  Link,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from '@tanstack/react-router';
import { getEntry } from './lib/content';
import { RootLayout } from './views/root-layout';
import {
  ArticleDetailPage,
  ArticlesPage,
  HomePage,
  ProjectDetailPage,
  ProjectsPage,
  ReadingDetailPage,
  ReadingNotesPage,
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
    const article = getEntry('articles', params.slug);
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
    const project = getEntry('projects', params.slug);
    if (!project) {
      throw notFound();
    }

    return project;
  },
  component: ProjectDetailRouteComponent,
});

const readingNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reading-notes',
  component: ReadingNotesPage,
});

const readingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reading-notes/$slug',
  loader: ({ params }) => {
    const note = getEntry('reading-notes', params.slug);
    if (!note) {
      throw notFound();
    }

    return note;
  },
  component: ReadingDetailRouteComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  articlesRoute,
  articleDetailRoute,
  projectsRoute,
  projectDetailRoute,
  readingNotesRoute,
  readingDetailRoute,
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

function ReadingDetailRouteComponent() {
  const note = readingDetailRoute.useLoaderData();
  return <ReadingDetailPage entry={note} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
