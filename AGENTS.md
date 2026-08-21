<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:opencode-stability-rules -->

## OpenCode stability guardrails

This repository is source-only. Generated exports, screenshots, browser traces and local preview state must never become reviewable workspace changes or be attached wholesale to a chat session.

### Before every non-trivial task

1. Read this file and run `git status --short` once. Treat existing user changes as untouchable.
2. State the exact source files expected to change. Do not recursively rewrite the repository to apply a visual change.
3. Do not scan, summarize, upload, or open a VCS review for generated output. If a task would produce hundreds of files, report a compact summary instead of a file-by-file diff.

### Builds, previews and screenshots

1. Next build output belongs only in the already ignored `out/`, `out-mobile/` or `.next/` directories. Never create or move exports into a new repository-root directory such as `out-m/`.
2. For local verification, serve the ignored `out/` directory directly or copy it to one unique directory under `/private/tmp/opc-preview-<task>/`. Never create preview/export directories inside source folders.
3. Screenshots, Playwright traces, browser console logs and accessibility snapshots go under `/private/tmp/opc-verify-<task>/`; never leave them in `.playwright-cli/` or another repository directory.
4. Use at most one local preview server per task, bind it to `127.0.0.1`, record its PID, and stop it before reporting completion. Reuse a healthy existing preview instead of starting another.
5. Before reporting completion, run `git status --short` again. Generated artifacts must not appear. If they do, stop and report their exact path and size; do not delete or move them without user approval.

### Large files, media and data

1. Do not re-read or re-process an entire database, image library or static export when the request names a specific page/component. Inspect only the required records/files first.
2. Use the existing source asset when possible. Do not duplicate image libraries or encode large image data directly in CSS, source code, prompts, or chat output.
3. If a requested action would touch more than 50 source files, generate more than 100 non-ignored files, or start more than one background process, stop and give a short scope/risk report before proceeding.

### Session and safety

1. Never clear application caches, session storage, drafts, cookies, credential stores or local databases as part of project work.
2. Never include raw build logs, huge git diffs, file trees, screenshots, or generated artifacts in the final response. Give paths, counts, sizes, and the three requested verification screenshots only.
3. Deployment is separate from build verification. Do not deploy unless the user expressly asks after reviewing the verification result.

<!-- END:opencode-stability-rules -->
