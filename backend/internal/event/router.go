package event

import (
	"context"
	"fmt"
)

type Handler func(context.Context, Event) error

type Router struct {
	handlers map[Type][]Handler
}

func NewRouter() *Router {
	return &Router{handlers: make(map[Type][]Handler)}
}

func (r *Router) Subscribe(eventType Type, handler Handler) {
	r.handlers[eventType] = append(r.handlers[eventType], handler)
}

func (r *Router) Publish(ctx context.Context, event Event) error {
	for _, handler := range r.handlers[event.Type] {
		if err := handler(ctx, event); err != nil {
			return fmt.Errorf("event handler failed: %w", err)
		}
	}
	return nil
}
