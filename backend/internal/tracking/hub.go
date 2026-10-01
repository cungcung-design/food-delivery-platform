package tracking

import "sync"

type Hub struct {
	mu    sync.Mutex
	rooms map[string]map[chan []byte]struct{}
}

func NewHub() *Hub {
	return &Hub{
		rooms: map[string]map[chan []byte]struct{}{},
	}
}

func (h *Hub) Subscribe(orderID string) chan []byte {
	ch := make(chan []byte, 8)

	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[orderID] == nil {
		h.rooms[orderID] = map[chan []byte]struct{}{}
	}
	h.rooms[orderID][ch] = struct{}{}

	return ch
}

func (h *Hub) Unsubscribe(orderID string, ch chan []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[orderID]; ok {
		delete(room, ch)
		if len(room) == 0 {
			delete(h.rooms, orderID)
		}
	}

	close(ch)
}

func (h *Hub) Publish(orderID string, payload []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for ch := range h.rooms[orderID] {
		select {
		case ch <- payload:
		default:
		}
	}
}
