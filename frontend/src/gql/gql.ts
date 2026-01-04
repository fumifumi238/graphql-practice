/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Ping {\n  ping {\n    message\n  }\n}": typeof types.PingDocument,
    "query Todos {\n  todos {\n    id\n    title\n    completed\n  }\n}\n\nfragment TodoFields on Todo {\n  id\n  title\n  completed\n}\n\nmutation AddTodo($title: String!) {\n  addTodo(title: $title) {\n    ...TodoFields\n  }\n}\n\nmutation ToggleTodo($id: ID!) {\n  toggleTodo(id: $id) {\n    id\n    title\n    completed\n  }\n}\n\nmutation DeleteTodo($id: ID!) {\n  deleteTodo(id: $id)\n}": typeof types.TodosDocument,
};
const documents: Documents = {
    "query Ping {\n  ping {\n    message\n  }\n}": types.PingDocument,
    "query Todos {\n  todos {\n    id\n    title\n    completed\n  }\n}\n\nfragment TodoFields on Todo {\n  id\n  title\n  completed\n}\n\nmutation AddTodo($title: String!) {\n  addTodo(title: $title) {\n    ...TodoFields\n  }\n}\n\nmutation ToggleTodo($id: ID!) {\n  toggleTodo(id: $id) {\n    id\n    title\n    completed\n  }\n}\n\nmutation DeleteTodo($id: ID!) {\n  deleteTodo(id: $id)\n}": types.TodosDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Ping {\n  ping {\n    message\n  }\n}"): (typeof documents)["query Ping {\n  ping {\n    message\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Todos {\n  todos {\n    id\n    title\n    completed\n  }\n}\n\nfragment TodoFields on Todo {\n  id\n  title\n  completed\n}\n\nmutation AddTodo($title: String!) {\n  addTodo(title: $title) {\n    ...TodoFields\n  }\n}\n\nmutation ToggleTodo($id: ID!) {\n  toggleTodo(id: $id) {\n    id\n    title\n    completed\n  }\n}\n\nmutation DeleteTodo($id: ID!) {\n  deleteTodo(id: $id)\n}"): (typeof documents)["query Todos {\n  todos {\n    id\n    title\n    completed\n  }\n}\n\nfragment TodoFields on Todo {\n  id\n  title\n  completed\n}\n\nmutation AddTodo($title: String!) {\n  addTodo(title: $title) {\n    ...TodoFields\n  }\n}\n\nmutation ToggleTodo($id: ID!) {\n  toggleTodo(id: $id) {\n    id\n    title\n    completed\n  }\n}\n\nmutation DeleteTodo($id: ID!) {\n  deleteTodo(id: $id)\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;