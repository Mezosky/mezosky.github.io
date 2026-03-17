# Workflow

## Before Editing

1. Inspect the relevant files first.
2. Prefer the current structure over unnecessary rewrites.
3. If the change is public-facing, make sure the result still represents Ignacio correctly.

## While Editing

1. Use `apply_patch` for manual file edits.
2. Keep changes focused and avoid restoring removed template clutter.
3. If styles are involved, prefer `_sass/_custom.scss` for the current custom layer.

## Verification

1. Run Prettier on touched text, YAML, Markdown, Liquid, JS, or SCSS files when applicable.
2. If Bundler is available, run a Jekyll build:

```bash
bundle exec jekyll build
```

3. If Bundler is not available, say so clearly in the final report.

## Finish

1. Check `git status`.
2. Commit the completed work with a clear message.
3. Push the finished work to `origin/master`.

This repo's current user preference is: when work is finished, push it.
