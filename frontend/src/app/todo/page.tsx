"use client";

import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import {
  TodosDocument,
  AddTodoDocument,
  ToggleTodoDocument,
  DeleteTodoDocument,
  TodoEventDocument,
} from "@/gql/graphql";
import { Reference } from "@apollo/client";

export default function TodosPage() {
  const [title, setTitle] = useState("");

  // Todos 取得
  const { data, loading, error } = useQuery(TodosDocument);

  useSubscription(TodoEventDocument, {
    onData({ data, client }) {
      const event = data.data?.todoEvent;
      if (!event) return;

      client.cache.modify({
        fields: {
          todos(
            existingRefs: readonly Reference[] = [],
            { readField, toReference }
          ): readonly Reference[] {
            switch (event.type) {
              case "ADDED": {
                const newRef = toReference(event.todo, true);
                if (!newRef) return existingRefs;
                return [...existingRefs, newRef];
              }

              case "UPDATED": {
                const updatedRef = toReference(event.todo, true);
                if (!updatedRef) return existingRefs;

                return existingRefs.map((ref) =>
                  readField("id", ref) === event.todo.id ? updatedRef : ref
                );
              }

              case "DELETED":
                return existingRefs.filter(
                  (ref) => readField("id", ref) !== event.todo.id
                );

              default:
                return existingRefs;
            }
          },
        },
      });
    },
  });

  // Todo 追加
  const [addTodo] = useMutation(AddTodoDocument);

  const [deleteTodo] = useMutation(DeleteTodoDocument);
  const [toggleTodo] = useMutation(ToggleTodoDocument);

  const handleDeleteTodo = (id: string) => {
    if (!window.confirm("この Todo を削除しますか？")) return;

    deleteTodo({
      variables: { id },
    });
  };
  // Todo 切り替え

  if (loading) return <p>loading...</p>;
  if (error) return <p>error</p>;

  const handleAddTodo = async () => {
    if (!title) return;

    await addTodo({
      variables: { title },
    });

    setTitle("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Todos</h1>

      <ul>
        {data?.todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  toggleTodo({
                    variables: { id: todo.id },
                  })
                }
              />
              {todo.title} {"  "}
            </label>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="new todo"
        />
        <button onClick={handleAddTodo}>add</button>
      </div>
    </div>
  );
}
