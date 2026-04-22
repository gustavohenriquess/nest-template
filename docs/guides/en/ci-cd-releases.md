# CI/CD & Release Automation

This project avoids manual DevOps tasks. Everything from code quality enforcement to versioning and releasing is fully automated via GitHub Actions and `standard-version`.

## 1. Modular Pipelines
Instead of one massive YAML file, our workflows are modular and reusable (`.github/workflows/`):

- `main.yml`: The orchestrator.
- `_setup.yml`: Installs Node.js and caches `npm` modules.
- `_quality.yml`: Runs Prettier, ESLint, and checks the 90% coverage threshold.
- `_tests.yml` & `_e2e-tests.yml`: Spins up databases and executes unit/E2E suites.
- `_release.yml`: Runs specifically when a tag is pushed, creating an official GitHub Release.

## 2. Generating a Release

We use [standard-version](https://github.com/conventional-changelog/standard-version) and Conventional Commits (`feat:`, `fix:`, etc.) to calculate SemVer version bumps.

When you are ready to release the current state of `main`:

1. Ensure your git tree is clean.
2. Run the release macro:
   ```bash
   make release
   ```
3. **What happens under the hood:**
   - The version in `package.json` is bumped automatically.
   - The root `CHANGELOG.md` is updated.
   - A historical version of the changelog is archived in `docs/changelogs/vX.X.X.md`.
   - A git commit and an annotated tag (e.g., `v1.2.0`) are generated.
   - It pushes the commit and tags to the remote.
   - GitHub Actions intercepts the tag and fires `_release.yml`, creating the public release page on GitHub.

## 3. Dependency Management
This template integrates with [Renovate Bot](https://docs.renovatebot.com/) to automatically scan and create Pull Requests for outdated npm dependencies, ensuring the project never rots over time.

## 4. Scaling Tips

As the project grows in testing volume, consider these strategies:

### Coverage Separation
If CI execution time exceeds 5 minutes, separate unit tests from coverage calculation to save execution minutes (Fail-Fast):
```yaml
coverage:
  needs: unit-tests # Only runs if unit tests pass
  uses: ./.github/workflows/_coverage.yml
```

### Optimization with `--onlyChanged`
For huge Pull Requests, you can configure Jest to test only what changed:
```bash
jest --onlyChanged
```

### Node.js Matrix
To ensure future stability across multiple Node versions:
```yaml
strategy:
  matrix:
    node-version: [24, 26]
```
