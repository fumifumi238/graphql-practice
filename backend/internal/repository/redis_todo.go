package repository

import (
	"context"
	"encoding/json"


	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)


type RedisTodoRepo struct {
	rdb *redis.Client
}

func NewRedisTodoRepo(rdb *redis.Client) *RedisTodoRepo {
	return &RedisTodoRepo{rdb: rdb}
}


func (r *RedisTodoRepo) List(ctx context.Context) ([]*Todo, error) {
	ids, _ := r.rdb.ZRange(ctx, "todos", 0, -1).Result()
	todos := make([]*Todo, 0, len(ids))
	for _, id := range ids {
		val, err := r.rdb.Get(ctx, "todo:"+id).Result()
		if err != nil {
			continue
		}
		var t Todo
		json.Unmarshal([]byte(val), &t)
		todos = append(todos, &t)
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

	b, _ := json.Marshal(todo)
	pipe := r.rdb.TxPipeline()
	pipe.Set(ctx, "todo:"+todo.ID, b, 0)
	pipe.ZAdd(ctx, "todos", redis.Z{Score: float64(len(todo.ID)), Member: todo.ID})
	_, err := pipe.Exec(ctx)
	return todo,err
}

func (r *RedisTodoRepo) Toggle(ctx context.Context, id string) (*Todo, error) {
	val, _ := r.rdb.Get(ctx, "todo:"+id).Result()
	var t Todo
	json.Unmarshal([]byte(val), &t)
	t.Completed = !t.Completed
	b, _ := json.Marshal(t)
	r.rdb.Set(ctx, "todo:"+id, b, 0)
	return &t, nil
}

func (r *RedisTodoRepo) Delete(ctx context.Context, id string) error {
	pipe := r.rdb.TxPipeline()
	pipe.Del(ctx, "todo:"+id)
	pipe.ZRem(ctx, "todos", id)
	_, err := pipe.Exec(ctx)
	return err
}
