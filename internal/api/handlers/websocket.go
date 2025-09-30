package handlers

import (
	"log"
	"net/http"
	"sync"
	"terraria-panel/internal/service"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, you should check the origin properly
		return true
	},
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// WebSocketClient represents a connected WebSocket client
type WebSocketClient struct {
	conn     *websocket.Conn
	send     chan WebSocketMessage
	userID   string
	username string
}

// WebSocketHub manages WebSocket connections
type WebSocketHub struct {
	clients    map[*WebSocketClient]bool
	register   chan *WebSocketClient
	unregister chan *WebSocketClient
	broadcast  chan WebSocketMessage
	mutex      sync.RWMutex
}

var hub = &WebSocketHub{
	clients:    make(map[*WebSocketClient]bool),
	register:   make(chan *WebSocketClient),
	unregister: make(chan *WebSocketClient),
	broadcast:  make(chan WebSocketMessage),
}

// Start the WebSocket hub
func init() {
	go hub.run()
	go startPeriodicUpdates()
}

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(c *gin.Context) {
	// Get user info from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	username, _ := c.Get("username")

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Create client
	client := &WebSocketClient{
		conn:     conn,
		send:     make(chan WebSocketMessage, 256),
		userID:   userID.(string),
		username: username.(string),
	}

	// Register client
	hub.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

// Run the WebSocket hub
func (h *WebSocketHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()

			log.Printf("WebSocket client connected: %s", client.username)

			// Send welcome message
			welcome := WebSocketMessage{
				Type:      "welcome",
				Data:      map[string]string{"message": "Connected to Terraria Panel"},
				Timestamp: time.Now(),
			}

			select {
			case client.send <- welcome:
			default:
				close(client.send)
				h.mutex.Lock()
				delete(h.clients, client)
				h.mutex.Unlock()
			}

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("WebSocket client disconnected: %s", client.username)
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// Read messages from WebSocket client
func (c *WebSocketClient) readPump() {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()

	// Set read deadline and pong handler
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		var msg WebSocketMessage
		err := c.conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming messages
		c.handleMessage(msg)
	}
}

// Write messages to WebSocket client
func (c *WebSocketClient) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Handle incoming WebSocket messages
func (c *WebSocketClient) handleMessage(msg WebSocketMessage) {
	switch msg.Type {
	case "ping":
		// Respond with pong
		pong := WebSocketMessage{
			Type:      "pong",
			Data:      map[string]string{"message": "pong"},
			Timestamp: time.Now(),
		}
		select {
		case c.send <- pong:
		default:
		}

	case "get_server_status":
		// Send current server status
		status, err := service.GetTerrariaServerStatus()
		if err != nil {
			log.Printf("Error getting server status: %v", err)
			return
		}

		response := WebSocketMessage{
			Type:      "server_status",
			Data:      status,
			Timestamp: time.Now(),
		}

		select {
		case c.send <- response:
		default:
		}

	default:
		log.Printf("Unknown WebSocket message type: %s", msg.Type)
	}
}

// Broadcast message to all connected clients
func BroadcastMessage(msgType string, data interface{}) {
	message := WebSocketMessage{
		Type:      msgType,
		Data:      data,
		Timestamp: time.Now(),
	}

	select {
	case hub.broadcast <- message:
	default:
		log.Printf("Failed to broadcast message: %s", msgType)
	}
}

// Start periodic updates
func startPeriodicUpdates() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Send server status update
			status, err := service.GetTerrariaServerStatus()
			if err != nil {
				log.Printf("Error getting server status for broadcast: %v", err)
				continue
			}

			BroadcastMessage("server_status_update", status)

			// Send system metrics update
			metrics, err := getSystemMetrics()
			if err != nil {
				log.Printf("Error getting system metrics for broadcast: %v", err)
				continue
			}

			BroadcastMessage("system_metrics_update", metrics)
		}
	}
}

// Get system metrics for broadcasting
func getSystemMetrics() (map[string]interface{}, error) {
	// This is a placeholder - implement actual system metrics collection
	metrics := map[string]interface{}{
		"cpu_usage":    0.0,
		"memory_usage": 0.0,
		"disk_usage":   0.0,
		"timestamp":    time.Now(),
	}

	return metrics, nil
}

// GetConnectedClients returns the number of connected WebSocket clients
func GetConnectedClients() int {
	hub.mutex.RLock()
	defer hub.mutex.RUnlock()
	return len(hub.clients)
}
