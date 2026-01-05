package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

import (

	"graphql-practice/backend/internal/repository"

	"github.com/redis/go-redis/v9"
)

type Resolver struct {
	TodoRepo repository.TodoRepo
	Redis    *redis.Client
}
