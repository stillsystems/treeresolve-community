---
name: "🐛 Bug Report"
about: Report an unexpected behavior, visual glitch, or merge conflict parsing issue
title: "[BUG] "
labels: ["bug"]
assignees: []
---

### Describe the Bug

A clear and concise description of what the bug is.

### Environment & Versions

* **TreeResolve Version**: (e.g. 0.1.0)
* **VS Code Version**: (e.g. 1.85.0)
* **Operating System**: (e.g. Windows 11 / macOS Sonoma / Ubuntu 22.04)
* **Git Version**: (e.g. 2.43.0)

### Conflict Reproduction Snippet

If this is related to conflict marker parsing or AST auto-merging, please provide a minimal code snippet illustrating the conflict:

```plaintext
<<<<<<< HEAD (Ours)
// code here
||||||| base (Base, if present)
// original common ancestor code
=======
// code here (Theirs)
>>>>>>> incoming
```

### Expected Behavior

A clear and concise description of what you expected to happen.

### Screenshots / Logs

If applicable, add screenshots or output from the developer console (`Help > Toggle Developer Tools`) to help explain your problem.
