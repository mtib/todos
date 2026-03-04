---
description: Build and verify Docker images before pushing code
---
// turbo-all
1. Run the build command to ensure no regressions or TypeScript errors:
   `docker compose build`
2. If the build succeeds, proceed with staging and committing:
   `git add . && git commit -m "your message"`
3. Push the changes to the remote repository:
   `git push`
