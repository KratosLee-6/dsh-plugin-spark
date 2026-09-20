# Repository ownership

- This repository contains only the Spark DSH plugin, its composition engine, storage, companion Studio, examples, tests and supporting documentation.
- Full AI Flashpoint product content, UI/VI planning, architecture, standalone application development and Windows/Android/iOS delivery belong in https://github.com/KratosLee-6/AI--boom.
- Read REPOSITORY-SCOPE.md before cross-repository work. Keep docs/ROADMAP.md scoped to plugin deliverables. Do not migrate private product plans or seed/customer data into this public repository.
- Plugin versions, tests and audit evidence apply only to the plugin. Reference pinned commits when coordinating integration; do not claim full-app acceptance from plugin CI.
- Preserve independent build/install instructions. Access to the product repository must not become a prerequisite for using Spark.
- Keep English and Chinese user-facing documentation aligned. For documentation-only changes run `npm run verify:release` and `npm run format:check`; run relevant existing runtime tests when code changes.
