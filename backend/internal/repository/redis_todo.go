package repository

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)


type RedisTodoRepo struct {
	rdb *redis.Client
}

func NewRedisTodoRepo(rdb *redis.Client) *RedisTodoRepo {
	return &RedisTodoRepo{rdb: rdb}
}

/*
--------------------
 helper
--------------------
*/

func marshal(v any) (string, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func unmarshal(s string, v any) error {
	return json.Unmarshal([]byte(s), v)
}

/*
--------------------
 Query
--------------------
*/

func (r *RedisTodoRepo) List(ctx context.Context) ([]*Todo, error) {
	ids, err := r.rdb.ZRange(ctx, "todos:zset", 0, -1).Result()
	if err != nil {
		return nil, err
	}

	todos := make([]*Todo, 0, len(ids))

	for _, id := range ids {
		val, err := r.rdb.Get(ctx, "todo:"+id).Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			return nil, err
		}

		var todo Todo
		if err := unmarshal(val, &todo); err != nil {
			return nil, err
		}

		todos = append(todos, &todo)
	}

	return todos, nil
}

/*
--------------------
 Mutation
--------------------
*/

func (r *RedisTodoRepo) Add(ctx context.Context, title string) (*Todo, error) {
	todo := &Todo{
		ID:        uuid.NewString(),
		Title:     title,
		Completed: false,
	}

	data, err := marshal(todo)
	if err != nil {
		return nil, err
	}

	score := float64(time.Now().UnixNano())

	pipe := r.rdb.TxPipeline()
	pipe.Set(ctx, "todo:"+todo.ID, data, 0)
	pipe.ZAdd(ctx, "todos:zset", redis.Z{
		Score:  score,
		Member: todo.ID,
	})

	if _, err := pipe.Exec(ctx); err != nil {
		return nil, err
	}

	return todo, nil
}

func (r *RedisTodoRepo) Toggle(ctx context.Context, id string) (*Todo, error) {
	key := "todo:" + id

	val, err := r.rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var todo Todo
	if err := unmarshal(val, &todo); err != nil {
		return nil, err
	}

	todo.Completed = !todo.Completed

	data, err := marshal(&todo)
	if err != nil {
		return nil, err
	}

	if err := r.rdb.Set(ctx, key, data, 0).Err(); err != nil {
		return nil, err
	}

	return &todo, nil
}

func (r *RedisTodoRepo) Delete(ctx context.Context, id string) error {
	pipe := r.rdb.TxPipeline()
	pipe.Del(ctx, "todo:"+id)
	pipe.ZRem(ctx, "todos:zset", id)

	_, err := pipe.Exec(ctx)
	return err
}
