# php-sso.github.io

The website of php-sso, published with GitHub Pages as the organisation site at
<https://php-sso.github.io/>.

It is plain HTML, CSS and a little JavaScript. There is no build step, no framework and no
dependencies, and the pages make no requests to other sites (the fonts are served from here).

## What is in it

| File | What it is |
| --- | --- |
| `index.html` | The home page: a hero with three example passes (three people, three ways in), then the features and a sign-in you can try. |
| `standards.html` | The specifications php-sso implements, each linked to its official text. |
| `404.html` | Shown by GitHub Pages for unknown addresses. |
| `assets/site.css` | All styles. Colours are variables at the top, with a dark theme that follows the system. |
| `assets/site.js` | The sign-in simulation. |
| `assets/fonts/` | IBM Plex Sans, Sans Condensed and Mono (SIL Open Font License, see `OFL.txt`). |
| `robots.txt`, `sitemap.xml` | For search engines. Add new pages to the sitemap. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Look at it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Any static file server works.

## Publish it

GitHub only serves an organisation site from a repository named exactly `php-sso.github.io`. This repository is that one,
and its Pages setting is "Deploy from a branch", branch `master`, folder `/ (root)`. Every push to `master` is live a minute later.

## The colours mean something

Every page opens on a deep indigo band, and the rest is light. Colour is used to tell the ways into php-sso apart, not to decorate: password is blue, SAML is teal, social is amber, SCIM is berry, and OpenID Connect (the way out to apps) is green. The same hues appear on the hero's passes, on the feature groups, and on the SAML and SCIM columns. They are variables at the top of `assets/site.css` (`--c-password`, `--c-saml`, `--c-social`, `--c-scim`, `--c-oidc`), with a light and a dark version. Keep one colour per meaning, and do not add colour that does not stand for something.

## Documentation lives elsewhere

This site does not explain how to install or run php-sso. The "Documentation" section on the home page points to the documentation of each repository (`php-sso`, `oauth-server`, `scim-server` and `saml`) and shows how to install each library. When that documentation moves, for example to its own site, change those links in `index.html`.

## Keeping the copy true

The pages describe what php-sso does today, including what it does not do yet (see "Where it
stands" on the home page). When php-sso gains or loses something, change the text here in the same
change. Do not claim certifications or audits that do not exist. The home page names the license (MIT) and the versions
(the application at 0.1, the libraries at 1.0): change them when the releases change.

The `amr` examples in the simulation on the home page mirror what the server really reports:
`pwd` for a password, `fed` for an outside account, `otp` and `mfa` for a code from the app, and
`mfa` alone for a recovery code.
