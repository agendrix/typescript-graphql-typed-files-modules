/* eslint-disable no-empty-pattern, @typescript-eslint/ban-types */
import {
  PluginFunction,
  PluginValidateFn,
} from "@graphql-codegen/plugin-helpers";
import { visit } from "graphql";

import TypedDocumentVisitor from "./visitors/TypedDocumentVisitor";

export type UserConfig = {};

export const plugin: PluginFunction<UserConfig> = (_schema, documents, {}) => {
  const config = {};

  const output: string[] = [];

  documents.forEach((document) => {
    if (!document.location) {
      throw new Error("Missing document location");
    }
    if (!document.document) {
      throw new Error("Missing document node");
    }

    const visitor = new TypedDocumentVisitor(output, document.location, config);

    visit(document.document, visitor);
  });

  const content = output.join("\n\n");
  return {
    prepend:
      content !== ""
        ? [
            'import { TypedDocumentNode } from "@graphql-typed-document-node/core";\n',
          ]
        : [],
    content,
  };
};

export const validate: PluginValidateFn<UserConfig> = () => undefined;
