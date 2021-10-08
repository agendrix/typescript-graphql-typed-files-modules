import { codegen } from "@graphql-codegen/core";
import { Types } from "@graphql-codegen/plugin-helpers";
import { plugin as typescriptOperationsPlugin } from "@graphql-codegen/typescript-operations";
import { buildSchema, parse, printSchema } from "graphql";

import * as codegenTypedDocuments from "../codegenTypedDocuments";

const schema = buildSchema(`
  type Author {
    idField: ID!
  }

  type Query {
    authors: [Author]
  }

  type Mutation {
    createAuthor: Author!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`);

const getConfig = (
  generateOptions: Partial<Types.GenerateOptions> = {},
  pluginOptions: Partial<codegenTypedDocuments.UserConfig> = {}
): Types.GenerateOptions => ({
  filename: "not-relevant",
  schema: parse(printSchema(schema)),
  plugins: [
    { typescriptOperationsPlugin: {} },
    {
      codegenTypedDocuments: {
        ...pluginOptions,
      },
    },
  ],
  pluginMap: {
    typescriptOperationsPlugin: { plugin: typescriptOperationsPlugin },
    codegenTypedDocuments,
  },
  config: {},
  documents: [],
  ...generateOptions,
});

describe("codegenTypedDocuments", () => {
  it("should not have any output when there are no documents", async () => {
    const config = getConfig();
    const output = await codegen(config);

    expect(output).toBe("");
  });

  it("should not have any output for fragment", async () => {
    const fragmentDocument = parse(`
      fragment authors on Author {
        idField
      }
    `);

    const document = {
      document: fragmentDocument,
      location: "authorFragment.gql",
    };

    const config = getConfig({ documents: [document] });
    const output = await codegen(config);

    expect(output).toBe(
      "export type AuthorsFragment = { __typename?: 'Author', idField: string };\n"
    );
  });

  it("should have default export for a single query document", async () => {
    const queryDocument = parse(`
      query authors {
        authors {
          idField
        }
      }
    `);

    const document = { document: queryDocument, location: "authors.gql" };

    const config = getConfig({ documents: [document] });
    const output = await codegen(config);

    expect(output).toBe(
      `
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type AuthorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthorsQuery = { __typename?: 'Query', authors?: Array<{ __typename?: 'Author', idField: string } | null | undefined> | null | undefined };

export const authors: TypedDocumentNode<AuthorsQuery, AuthorsQueryVariables>;
export default authors;
`.trimStart()
    );
  });

  it("should have default export for a single mutation document", async () => {
    const mutationDocument = parse(`
      mutation createAuthor {
        createAuthor {
          idField
        }
      }
    `);

    const document = {
      document: mutationDocument,
      location: "createAuthors.gql",
    };

    const config = getConfig({ documents: [document] });
    const output = await codegen(config);

    expect(output).toBe(
      `
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type CreateAuthorMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateAuthorMutation = { __typename?: 'Mutation', createAuthor: { __typename?: 'Author', idField: string } };

export const createAuthor: TypedDocumentNode<CreateAuthorMutation, CreateAuthorMutationVariables>;
export default createAuthor;
`.trimStart()
    );
  });

  it("should not have default exports for multiple operations", async () => {
    const document = parse(`
      query authors {
        authors {
          idField
        }
      }

      query alsoAuthors {
        authors {
          idField
        }
      } 

      mutation createAuthor {
        createAuthor {
          idField
        }
      }

      mutation alsoCreateAuthor {
        createAuthor {
          idField
        }
      }
    `);

    const config = getConfig({
      documents: [{ document, location: "authors.gql" }],
    });
    const output = await codegen(config);

    expect(output).toBe(
      `
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type AuthorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthorsQuery = { __typename?: 'Query', authors?: Array<{ __typename?: 'Author', idField: string } | null | undefined> | null | undefined };

export type AlsoAuthorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AlsoAuthorsQuery = { __typename?: 'Query', authors?: Array<{ __typename?: 'Author', idField: string } | null | undefined> | null | undefined };

export type CreateAuthorMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateAuthorMutation = { __typename?: 'Mutation', createAuthor: { __typename?: 'Author', idField: string } };

export type AlsoCreateAuthorMutationVariables = Exact<{ [key: string]: never; }>;


export type AlsoCreateAuthorMutation = { __typename?: 'Mutation', createAuthor: { __typename?: 'Author', idField: string } };

export const authors: TypedDocumentNode<AuthorsQuery, AuthorsQueryVariables>;
export const alsoAuthors: TypedDocumentNode<AlsoAuthorsQuery, AlsoAuthorsQueryVariables>;
export const createAuthor: TypedDocumentNode<CreateAuthorMutation, CreateAuthorMutationVariables>;
export const alsoCreateAuthor: TypedDocumentNode<AlsoCreateAuthorMutation, AlsoCreateAuthorMutationVariables>;
`.trimStart()
    );
  });
});
