---
name: "🚀 Language Request"
about: Request deterministic AST auto-resolution support for a new programming language
title: "[LANG] Support for "
labels: ["language-request"]
assignees: []
---

### Requested Language

* **Language Name**: (e.g., C#, Rust, Ruby, Elixir, PHP, Kotlin)
* **File Extensions**: (e.g., `.rs`, `.cs`, `.kt`)
* **Tree-sitter Grammar URL**: (e.g., `https://github.com/tree-sitter/tree-sitter-rust`)

### Target Semantic Constructs for Auto-Resolution

Which language constructs frequently cause false merge conflicts that you would like TreeResolve to auto-resolve deterministically?

* [ ] Disjoint module/package imports or using directives (e.g. `use ...`, `import ...`, `using ...`)
* [ ] Enum variant additions
* [ ] Struct / Class / Interface field or method additions
* [ ] Dictionary / Map key deduplication
* [ ] Other (describe below)

### Minimal Conflict Example

Provide an example of a common non-colliding conflict in this language:

```plaintext
<<<<<<< HEAD (Ours)
// code here
=======
// code here (Theirs)
>>>>>>> incoming
```

### Ideal Resolved Output

Show what the resulting code should look like after automatic resolution:

```plaintext
// ideal merged code
```
