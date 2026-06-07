# Push Instructions

This folder is intended to become the root of the separate research repository:

```text
git@github.com:dpan538/browser-local-rag-lab.git
```

From this folder:

```bash
git init
git add .
git commit -m "research: scaffold browser-local rag lab"
git branch -M main
git remote add origin git@github.com:dpan538/browser-local-rag-lab.git
git push -u origin main
```

Then create the first release tag:

```bash
git tag -a v0.1.0-lab-scaffold -m "Initial browser-local RAG lab scaffold"
git push origin v0.1.0-lab-scaffold
```

Do not copy archive product source files, raw capture directories, model cache,
browser cache, or downloaded images into this repository.
