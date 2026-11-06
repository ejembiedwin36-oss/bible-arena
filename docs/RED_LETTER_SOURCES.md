# Red-letter Bible data

The KJV red-letter reader uses locally bundled verse text and `words_of_christ` marker ranges originally sourced from [renniemaharaj/kjv-bible](https://github.com/renniemaharaj/kjv-bible), which describes the repository as MIT-licensed in its README. KJV text is public domain in many jurisdictions; check local reuse requirements. The upstream repository currently does not include a standalone LICENSE file.

Bible Arena only highlights words when its displayed verse exactly matches the source KJV verse. Any mismatch or missing annotation leaves the verse in normal text rather than incorrectly attributing speech to Jesus. Red-letter annotations are editorial interpretations, and editions may disagree, especially in John and Revelation.

The eight annotated books are bundled under `src/data/redLetters/` and lazy-loaded as application assets. The reader no longer depends on GitHub's raw-content service at runtime. A warning is displayed if a local chunk fails to load. The corpus is not guaranteed to cover every disputed passage; annotations remain editorial and must be audited.
