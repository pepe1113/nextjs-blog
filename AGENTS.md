# Repository Guidelines

專案沒有測試，不要跑測試 script

## Project Structure & Module Organization

This is a Next.js 15 blog built from the Tailwind Next.js Starter Blog pattern.

- `app/`: App Router pages, metadata routes, and top-level rendering.
- `components/`: Shared React components.
- `layouts/`: Post and list layout components used by MDX content.
- `data/`: Site metadata, navigation, authors, projects, and blog posts.
- `data/blog/`: Markdown and MDX posts. Put post-specific images beside the post when useful.
- `public/static/`: Public images, favicons, and other static assets.
- `css/`: Tailwind and Prism styles.
- `scripts/`: Build-time helpers such as RSS and postbuild generation.

## Build, Test, and Development Commands

- `burn run start`: Start the local Next.js development server.
- `bun run build`: Build the production site and run `scripts/postbuild.mjs`.
- `burn run lint`: Run Next/ESLint with auto-fix on app, component, layout, lib, and script paths.

## Coding Style & Naming Conventions

Use TypeScript for React code (`.ts`, `.tsx`) and MDX/Markdown for content (`.mdx`, `.md`). Prettier is authoritative: 2-space indentation, no semicolons, single quotes, `printWidth: 100`, trailing commas where valid, and Tailwind class sorting via `prettier-plugin-tailwindcss`.

Name React components in `PascalCase`, hooks with `use` prefixes, and content slugs in lowercase kebab-case, for example `data/blog/my-post-title.mdx`.

## Testing Guidelines

No test framework is configured yet. Always run `burn run lint`  after code or content changes that affect rendering. Don't run build.
If need test, please run `bun run start`, and close it 

所有測試/build/dev 都要有 timeout。完成或失敗後，請用 ps 確認沒有殘留的 node/npm/next 程序；如果有，請先 kill 掉再回覆我。

## Commit & Pull Request Guidelines

keep commit messages short, imperative, and specific, for example `Add Canada photo post` or `Fix post layout spacing`.

