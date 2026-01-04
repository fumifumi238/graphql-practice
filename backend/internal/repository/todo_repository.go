package repository

import "context"

type Todo struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

type TodoRepo interface {
	List(ctx context.Context) ([]*Todo, error)
	Add(ctx context.Context, title string) (*Todo, error)
	Toggle(ctx context.Context, id string) (*Todo, error)
	Delete(ctx context.Context, id string) error
}
