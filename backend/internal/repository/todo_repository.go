package repository

import "context"

type Todo struct {
	ID        string
	Title     string
	Completed bool
}

type TodoRepo interface {
	List(ctx context.Context) ([]*Todo, error)
	Add(ctx context.Context, title string) (*Todo, error)
	Toggle(ctx context.Context, id string) (*Todo, error)
}
