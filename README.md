# T4EQ — Tech for Equality

Source for the [Tech for Equality](https://t4eq.org) website — a static site
built with [Hugo](https://gohugo.io/) (extended) using a custom in-house theme.

## Requirements

- **Hugo extended**, `v0.162.1` or newer.
  Prebuilt binaries: <https://github.com/gohugoio/hugo/releases>.
  On macOS: `brew install hugo`.

> The site uses features (e.g. `.Site.Language.Locale`) that require a recent
> Hugo. Keep your local version in sync with the `HUGO_VERSION` pinned in
> [.github/workflows/hugo.yml](.github/workflows/hugo.yml).

## Local development

Serve the site with live reload at <http://localhost:1313>:

```sh
hugo server --disableFastRender --noHTTPCache
```

Produce a production build into `public/`:

```sh
hugo --minify
```

## Project structure

```
hugo.toml        -> Site configuration (baseURL, menus, params).
content/         -> Page content and front matter (Markdown).
data/            -> Structured data (team.yaml, services.yaml).
static/          -> Assets served as-is:
  css/main.css   ->   The single active stylesheet.
  js/main.js     ->   Site JavaScript (nav, contact form).
  images/        ->   Logos, team photos, mockups.
layouts/         -> The ACTIVE templates that render the site:
  _default/      ->   Per-page templates (team, work, contact, ...).
  partials/      ->   Reusable partials + components/.
themes/t4eq/     -> Legacy theme copy — NOT used for rendering (root
                    layouts/ and static/ take precedence).
```

> When editing templates, styles, or scripts, edit the files under the
> repository root (`layouts/`, `static/css/main.css`, `static/js/main.js`).
> The copies inside `themes/t4eq/` are not used.

## Editing content

- **Pages** live in `content/` as Markdown with YAML/TOML front matter.
  Create a new page with `hugo new content content/<name>.md`.
- **Team members** are defined in [data/team.yaml](data/team.yaml).
- **Services** are defined in [data/services.yaml](data/services.yaml).
- **Navigation and footer menus** are configured in the `[menu]` section of
  [hugo.toml](hugo.toml).

## Publishing (production)

The production site is published to **GitHub Pages** and served at
**<https://t4eq.org>**.

Deployment is automated by
[.github/workflows/hugo.yml](.github/workflows/hugo.yml):

1. Open a pull request with your changes and get it reviewed.
2. Merge into the **`main`** branch.
3. On push to `main`, the workflow builds the site with `hugo --minify` and
   deploys it to GitHub Pages via `actions/deploy-pages`.

The workflow also builds (but does **not** deploy) on the `redesign` branch, so
you can confirm the build passes before merging.

## Preview / staging site

A hidden staging build (the "v2" redesign) is published under a subpath so work
can be reviewed before going live:

- URL: **<https://t4eq.org/preview/v2-july-2026/>** (not linked anywhere; the
  bare `/preview/` path returns 404 by design).
- Hosted from a separate public repository, **`T4EQ/preview`**, which has
  GitHub Pages enabled with the `workflow` build type.

### How the branches and remotes fit together

You work in a single local clone with two remotes and two branches:

| Remote    | Repository              | Purpose                                    |
| --------- | ----------------------- | ------------------------------------------ |
| `origin`  | `T4EQ/T4EQ.github.io`   | The main site (production, t4eq.org).      |
| `preview` | `T4EQ/preview`          | The staging site (`/preview/v2-july-2026/`). |

- **`redesign`** is the source of truth for the v2 site. **All real edits**
  (content, data, styles, templates) happen here.
- **`deploy/preview`** is `redesign` plus a few preview-only CI commits (build
  into a subfolder, set the subpath baseURL, enable `canonifyURLs`). Its only
  job is to publish the staging site — you don't edit code directly on it.

```
redesign  ──►  real code, source of truth  (push to origin)
   │  merge into
   ▼
deploy/preview  ──►  redesign + CI tweaks  (push to preview → t4eq.org/preview/)
```

### Updating the preview after you make changes

All real editing happens on **`redesign`**; `deploy/preview` is only used to
publish. From the repo root:

1. **Edit on `redesign`:**

   ```sh
   git switch redesign
   ```

   Make your changes (content in `content/`, data in `data/`, styles in
   `static/css/main.css`, templates in `layouts/`).

2. **Check them locally first** — the local server rebuilds automatically:

   ```sh
   hugo server --disableFastRender --noHTTPCache
   ```

   Open <http://localhost:1313> and confirm the change looks right.

3. **Commit and back up `redesign`:**

   ```sh
   git add -A
   git commit -m "Describe what you changed"
   git push origin redesign
   ```

4. **Fold the changes into `deploy/preview` and publish** — merging keeps the
   push to the preview remote a simple fast-forward (no force-push needed):

   ```sh
   git switch deploy/preview
   git merge redesign
   git push preview deploy/preview:main
   ```

5. **Wait for the build to finish** (about a minute), then reload
   <https://t4eq.org/preview/v2-july-2026/>. To watch the deploy from the
   terminal:

   ```sh
   gh run watch --repo T4EQ/preview --exit-status
   ```

6. **Switch back to `redesign`** for your next round of edits:

   ```sh
   git switch redesign
   ```

> **Tip:** if the page looks stale, it's usually browser/CDN caching — do a
> hard refresh (Cmd+Shift+R) or add `?v=2` to the URL.

### Important: keep preview changes out of production

The preview workflow differs from production in three ways:

- it builds into a `v2-july-2026/` subfolder,
- it sets `--baseURL` to the `/preview/v2-july-2026/` subpath, and
- it enables `HUGO_CANONIFYURLS: true` so that root-absolute asset and link
  paths (`/css/...`, `/images/...`, `/partners/`) resolve correctly under the
  subpath.

These preview-only settings live on the `deploy/preview` branch and must not be
merged into `main`.
