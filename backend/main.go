package main

import (
	"context"
	"graphql-practice/backend/graph"
	"graphql-practice/backend/internal/repository"
	"log"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
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
	ctx := context.Background()

	// 1️⃣ Redis 接続
	rdb := redis.NewClient(&redis.Options{
		Addr: "redis:6379",
		// Password: "", // 必要なら
		// DB:       0,
	})

	// 接続確認（超重要）
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("failed to connect redis: %v", err)
	}

	// 2️⃣ Repository 作成
	todoRepo := repository.NewRedisTodoRepo(rdb)

	// 3️⃣ Resolver に注入
	resolver := &graph.Resolver{
		TodoRepo: todoRepo,
		Redis: rdb,
	}

	// 4️⃣ GraphQL Server
	srv := handler.NewDefaultServer(
		graph.NewExecutableSchema(
			graph.Config{
				Resolvers: resolver,
			},
		),
	)

	// 5️⃣ Gin
	r := gin.Default()
	SetupCORS(r)

	r.POST("/graphql", gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL Playground", "/graphql")))

	r.Run(":8080")
}
