package repository

import (
	"context"
	"strconv"

	"github.com/redis/go-redis/v9"
)

type RedisTodoRepo struct {
	rdb *redis.Client
}

func NewRedisTodoRepository(rdb *redis.Client) *RedisTodoRepo {
	return &RedisTodoRepo{
		rdb: rdb,
	}
}

func (r *RedisTodoRepo) List(
	ctx context.Context,
) ([]*Todo, error) {
	ids, err := r.rdb.SMembers(ctx, "todo:ids").Result()
	if err != nil {
		return nil, err
	}

	todos := make([]*Todo, 0, len(ids))

	for _, id := range ids {
		key := "todo:" + id

		data, err := r.rdb.HGetAll(ctx, key).Result()
		if err != nil {
			return nil, err
		}

		if len(data) == 0 {
			continue
		}

		completed, _ := strconv.ParseBool(data["completed"])

		todos = append(todos, &Todo{
			ID:        data["id"],
			Title:     data["title"],
			Completed: completed,
		})
	}

	return todos, nil
}

func (r *RedisTodoRepo) Add(
	ctx context.Context,
	title string,
) (*Todo, error) {
	// 1️⃣ ID を自動生成
	id, err := r.rdb.Incr(ctx, "todo:id").Result()
	if err != nil {
		return nil, err
	}

	key := "todo:" + strconv.FormatInt(id, 10)

	todo := &Todo{
		ID:        strconv.FormatInt(id, 10),
		Title:     title,
		Completed: false,
	}

	// 2️⃣ Hash に保存
	err = r.rdb.HSet(ctx, key, map[string]interface{}{
		"id":        todo.ID,
		"title":     todo.Title,
		"completed": "false",
	}).Err()
	if err != nil {
		return nil, err
	}

	// 3️⃣ 一覧用 Set に追加
	err = r.rdb.SAdd(ctx, "todo:ids", todo.ID).Err()
	if err != nil {
		return nil, err
	}

	return todo, nil
}

func (r *RedisTodoRepo) Toggle(
	ctx context.Context,
	id string,
) (*Todo, error) {
	key := "todo:" + id

	// 現在の状態取得
	completedStr, err := r.rdb.HGet(ctx, key, "completed").Result()
	if err != nil {
		return nil, err
	}

	completed, _ := strconv.ParseBool(completedStr)
	newCompleted := !completed

	// 更新
	err = r.rdb.HSet(ctx, key, "completed", strconv.FormatBool(newCompleted)).Err()
	if err != nil {
		return nil, err
	}

	title, err := r.rdb.HGet(ctx, key, "title").Result()
	if err != nil {
		return nil, err
	}

	return &Todo{
		ID:        id,
		Title:     title,
		Completed: newCompleted,
	}, nil
}
