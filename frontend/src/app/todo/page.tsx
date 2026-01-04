"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  TodosDocument,
  AddTodoDocument,
  ToggleTodoDocument,
  DeleteTodoDocument,
} from "@/gql/graphql";
import { Reference } from "@apollo/client";

export default function TodosPage() {
  const [title, setTitle] = useState("");

  // Todos 取得
  const { data, loading, error } = useQuery(TodosDocument);

  // Todo 追加
  const [addTodo] = useMutation(AddTodoDocument, {
    update(cache, { data }) {
      if (!data?.addTodo) return;

      cache.modify({
        fields: {
          todos(existing = [], { toReference }) {
            const newRef = toReference(data.addTodo, true);
            return [...existing, newRef];
          },
        },
      });
    },
  });

  const [deleteTodo] = useMutation(DeleteTodoDocument, {
    update(cache, { data }, { variables }) {
      if (!data?.deleteTodo || !variables?.id) return;

      cache.modify({
        fields: {
          todos(
            existingRefs: readonly Reference[] = [],
            { readField }
          ): Reference[] {
            return existingRefs.filter(
              (todoRef) => readField("id", todoRef) !== variables.id
            );
          },
        },
      });
    },
  });

  const handleDeleteTodo = (id: string) => {
    if (!window.confirm("この Todo を削除しますか？")) return;

    deleteTodo({
      variables: { id },
    });
  };
  // Todo 切り替え
  const [toggleTodo] = useMutation(ToggleTodoDocument);

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
