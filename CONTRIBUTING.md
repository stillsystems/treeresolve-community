# Contributing to TreeResolve

Thank you for your interest in contributing to **TreeResolve**!

TreeResolve provides deterministic, syntax-aware 3-way merge conflict resolution for VS Code powered by Tree-sitter. We appreciate contributions from the community—whether that involves reporting bugs, proposing new programming language grammars, improving documentation, or participating in discussions.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [contact@stillsystems.com](mailto:contact@stillsystems.com).

---

## How Can You Contribute?

### 1. Reporting Bugs

If you discover an issue, unexpected behavior, or syntax parsing failure during a merge conflict:

1. Check existing issues on our [Issue Tracker](https://github.com/stillsystems/treeresolve-community/issues) to ensure it hasn't already been reported.
2. If not, open a new issue using the **[Bug Report Template](https://github.com/stillsystems/treeresolve-community/issues/new?template=bug_report.yml)**.
3. Provide a minimal reproducible example, including:
   - Programming language & file extension.
   - The conflict snippet (Base, Ours, Theirs).
   - Expected resolution vs. observed behavior.
   - Operating system and VS Code extension version.

### 2. Requesting Support for New Languages

TreeResolve supports TypeScript, JavaScript, Python, Go, Rust, and JSON. We prioritize adding new Tree-sitter language grammars based on community demand.

- To request a new language or grammar normalizer, use our **[Language / AST Feature Request Template](https://github.com/stillsystems/treeresolve-community/issues/new?template=feature_request.yml)**.
- Include links to the official Tree-sitter grammar repository if available.

### 3. Improving Documentation & Examples

Contributions to our public documentation, website guides, and sample conflicts are warmly welcomed:

- Fix typos, unclear phrasing, or outdated steps.
- Add practical merge conflict examples demonstrating AST reconciliation.
- Improve our [Interactive Documentation](https://stillsystems.github.io/treeresolve-community/).

### 4. Community Discussions

Have a question about AST merge conflict heuristics, licensing, or integration? Join our [GitHub Discussions](https://github.com/stillsystems/treeresolve-community/discussions):
- **Q&A**: Ask questions and get answers from maintainers and peers.
- **Ideas**: Propose workflow enhancements or IDE integration ideas.
- **Show and Tell**: Share how TreeResolve fits into your team's Git workflows.

---

## Submitting Pull Requests

For documentation, examples, and community site improvements:

1. Fork the [treeresolve-community](https://github.com/stillsystems/treeresolve-community) repository.
2. Create a focused topic branch (`git checkout -b docs/clarify-ast-resolution`).
3. Commit your changes with clear, descriptive commit messages.
4. Verify markdown formatting and links.
5. Push to your fork and submit a Pull Request against the `main` branch.
6. Fill out the pull request template checklist.

A maintainer will review your pull request promptly.

---

## Licensing of Contributions

By contributing to TreeResolve Community repositories, you agree that your contributions will be licensed under the repository's [MIT License](LICENSE).
