# Typescript Graphql Typed Files Modules

Provides [graphql-codegen plugins](https://graphql-code-generator.com/) for type safe GraphQL documents (`DocumentNode`).

It allows functions to accept a generic `TypedDocumentNode<TVariables, TData>` so that types of other arguments or the return type can be inferred.

It is helpful for TypeScript projects but also if used only within an IDE, e.g. it works extremely well with VSCode (uses TypeScript behind the scenes).

```sh
$ yarn add -D typescript-graphql-typed-files-modules
```

## graphqlTypedFilesModules

Generates TypeScript typings for `.gql` files.

Similar to `@graphql-codegen/typescript-graphql-files-modules` (https://graphql-code-generator.com/docs/plugins/typescript-graphql-files-modules).

The difference is that it uses generic types, so that you have type safety with your own implementation (e.g. `useQuery` / `useMutation` hooks).

### Install

```sh
$ yarn add -D @graphql-codegen/add @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-typed-document-node/core
$ yarn add -D typescript-graphql-typed-files-modules
```

`codegen.yml`:

```yml
schema: schema.gql
documents: src/**/*.gql
generates:
  src/graphql/types.ts:
    plugins:
      - typescript
    config:
      enumsAsTypes: true
      skipTypename: true
      onlyOperationTypes: true
  src:
    preset: near-operation-file
    presetConfig:
      extension: .gql.d.ts
      baseTypesPath: graphql/types.ts
    plugins:
      - add:
          content: "/** Generated File. Do not modify directly. */"
      - typescript-operations
      - typescript-graphql-typed-files-modules
    config:
      skipTypename: true
```

### Example

`src/authors.gql`:

```graphql
query authors {
  authors {
    id
    createdAt
    name
    description
    books {
      id
      title
    }
  }
}
```

`src/graphqlTypedFilesModules.d.ts` (generated):

```ts
import * as Types from './graphql/types';

import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type AuthorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthorsQuery = { authors?: Array<{ idField: string } | null> | null };

export const authors: TypedDocumentNode<AuthorsQuery, AuthorsQueryVariables>;
export default authors;
```

`src/createAuthor.gql`:

```graphql
mutation createAuthor($input: AuthorInput!) {
  createAuthor(input: $input) {
    id
    createdAt
    name
    description
    books {
      id
      title
    }
  }
}
```

`src/graphqlTypedFilesModules.d.ts` (generated):

```ts
import * as Types from './graphql/types';

import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type CreateAuthorMutationVariables = Types.Exact<{
  input: Types.CreateAuthorInput;
}>


export type CreateAuthorMutation = { createAuthor: { id: string; createdAt: Types.Scalars['Date']; name: string; description: string; books: { id: string; title: string } } };

export const createAuthor: TypedDocumentNode<CreateAuthorMutation, CreateAuthorMutationVariables>;
export default createAuthor;
```

`src/AuthorList.tsx`:

```js
// Inferred type:
import authorsQuery from "./authors.gql";
// Inferred type: TypedDocumentNode<CreateAuthorMutation, CreateAuthorMutationVariables>
import createAuthorMutation from "./createAuthor.gql";

// ...
```

---

_This repository is a fork of [rubengrill/apollo-typed-documents](https://github.com/rubengrill/apollo-typed-documents) from by Ruben Grill <ruben@purelabs.io>._
