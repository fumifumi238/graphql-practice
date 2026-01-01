package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.


import "sync"
import "graphql-practice/backend/graph/model"

type Resolver struct {
	mu    sync.Mutex
	todos []*model.Todo
}
