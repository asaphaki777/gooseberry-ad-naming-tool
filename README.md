# Gooseberry Ad Naming Tool

A complete static website. No installation, accounts, packages or build commands needed to use it.

## Try it on your computer

1. Unzip `gooseberry-ad-naming.zip`.
2. Open the folder and double-click `index.html` to open it in your browser.
3. Complete the fields and click **Generate ad names**.
4. Copy one name or all three. If your browser blocks clipboard access for local files, the tool displays selectable text for manual copying. Clipboard copying works on the HTTPS GitHub Pages site.

Keep index.html, styles.css, catalog.js, naming.js and app.js together in the same folder.

## Put it online with GitHub Pages — no coding needed

A “repository” is simply your project's folder on GitHub. A “commit” means saving a change.

1. Sign in at https://github.com (create an account first if needed).
2. Click the **+** in the upper-right corner, then **New repository**.
3. Name it `gooseberry-ad-naming`. Select **Public**, select **Add a README file**, then click **Create repository**. Public means the website files are visible to others.
4. In your new repository, click **Add file → Upload files**.
5. Open your unzipped folder. Drag **index.html**, **styles.css**, **catalog.js**, **naming.js**, and **app.js** into GitHub. Upload the files themselves, not the ZIP or enclosing folder. You can also upload this README.md.
6. Click **Commit changes**. If GitHub asks which branch to use, keep **main**.
7. Click the repository's **Settings**, then **Pages** in the left sidebar.
8. Under **Build and deployment**, choose **Deploy from a branch** as the Source.
9. Under Branch, choose **main** and **/(root)**, then click **Save**.
10. Wait a few minutes and refresh Settings → Pages. Click **Visit site** when the site is ready. Your address will look like `https://YOUR-USERNAME.github.io/gooseberry-ad-naming/`.

If the site shows a 404, check that index.html is visible directly on the repository's main file list, and that Pages uses main and /(root). Check the Actions tab if publishing reports a failure. If a change appears delayed, refresh the page or try a private browser window.

To update later: return to **Add file → Upload files**, upload the updated files using the same filenames, and commit the changes. Pages publishes the updated version automatically.

Official GitHub guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Naming rules

`GSB_YYMMDD_Stage_Concept_Collection_Product_Quality_Handle_Dimensions_v1`

- Every successful generation produces exactly three names per entry, in this order: 4x5, 1x1, 9x16.
- Date defaults to the browser's local date and is formatted as YYMMDD without timezone conversion.
- All 19 collections and their exact supplied products are alphabetized in dropdowns.
- Spaces, capitalization, ampersands, curly apostrophes and em dashes are preserved literally. No URL encoding or slug conversion is applied.
- **Mixed Collections** overrides the collection with `Mixed Collections` and the product with exactly `Mixed Set`.
- **Set** represents multiple products from one selected collection by using `Set` as the product token. It does not require individual product selection. Mixed Collections takes priority.
- **No Handle** removes the entire handle field, including its separator, rather than inserting an empty token.
- Handles have outer whitespace and one leading @ removed. Letters, numbers, dots and underscores are allowed. Internal underscores are preserved; a handle containing underscores therefore cannot be unambiguously parsed by splitting the whole name on underscores alone.
- Version is a whole number from 1 through 999999, prefixed with v. Leading zeros are normalized.
- Changing inputs clears generated names to prevent copying stale results.
- Ad entries are not sent to a server or saved between visits. The interface is dark only (#1e1e1e). No tracking or runtime libraries. Headings use Helvetica/Arial with system fallbacks; no external fonts are loaded.

## Files

- index.html — page and form
- styles.css — appearance and responsive layout
- catalog.js — exact collection/product lists
- naming.js — naming rules and validation
- app.js — Single/Batch forms, duplication and copy behavior

## Entries, locks and custom values

All entries use one form. Lock any field to share its current value across existing and new entries. Unlock to edit each entry independently. ADD ANOTHER copies the last entry; locked fields stay fixed, unlocked fields can be changed. Product locks also lock Collection; unlocking Collection unlocks Product. Related Mixed Collections, Set and No Handle checkboxes follow their field locks.

Stage and Concept include Custom. Select it and enter your own text; spaces and punctuation are preserved, except underscores and line breaks are disallowed to protect field separators. Custom text can also be locked.

## Verification

Browser-checked unified form, Custom Stage and Concept output, locked custom Stage carried into AD-02, and six generated names for two entries. Earlier checks covered per-entry concepts, shared locks, copy behavior and exact catalog options.

## Appearance

Dark-gray and white rounded interface with the supplied Gooseberry logo. Upload gooseberry-logo.png alongside index.html, styles.css, app.js, naming.js and catalog.js. Entry labels use AD-01, AD-02, and so on. Empty results show “AD NAMES WILL SHOW UP HERE”; generated results show “AD NAMES”.
