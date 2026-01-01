package main

import (
	"graphql-practice/backend/graph"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupCORS(r *gin.Engine) {
	r.Use(cors.New(cors.Config{
		// React アプリのホストURLを指定
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
}

func main() {
	r := gin.Default()
		srv := handler.NewDefaultServer(
		graph.NewExecutableSchema(
			graph.Config{Resolvers: &graph.Resolver{}},
		),
	)

	SetupCORS(r)

	// GraphQL endpoint
	r.POST("/graphql", gin.WrapH(srv))

	// Playground
	r.GET("/", gin.WrapH(playground.Handler("GraphQL", "/graphql")))
	r.Run(":8080")
}
