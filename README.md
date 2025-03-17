Steps for running locally:
```
  npm i
  npm run create
  npm run build
  npm run dev
```

Then navigate to http://localhost:3131

This set of commands installs packages, builds and populates a sqlite db, builds the typescript, and runs the API

Notable next steps:
- Add a mutations step to the GraphQL API with its own resolver
- Create unit tests with a mock Prisma db
- Possibly move explicit m-n pivot table to an implicit relationship
