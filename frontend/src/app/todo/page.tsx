"use client";

import { AddTodoDocument, TodosDocument } from "@/gql/graphql";
import { useQuery } from "@apollo/client/react";

export default function Todo() {
  const { data, loading } = useQuery(TodosDocument);

  if (loading) return <p>loading...</p>;
  return (
    <>
      <ul>
        {data?.todos.map((todo) => (
          <li key={todo.id}>
            <p>{todo.title}</p>
            <input type="checkbox" />
          </li>
        ))}
      </ul>
      <input type="text" />
      <button type="submit">add</button>
    </>
  );
}
