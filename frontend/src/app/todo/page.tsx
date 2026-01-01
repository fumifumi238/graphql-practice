"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  TodosDocument,
  AddTodoDocument,
  ToggleTodoDocument,
} from "@/gql/graphql";


export default function TodosPage() {
  const [title, setTitle] = useState("");

  // Todos 取得
  const { data, loading, error } = useQuery(TodosDocument);

  // Todo 追加
  const [addTodo] = useMutation(AddTodoDocument);

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
              {todo.title}
            </label>
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
