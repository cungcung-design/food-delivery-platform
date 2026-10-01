package main

import (
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	db "github.com/cungcung-design/food-delivery-platform/backend/db/generated"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/ai"
	auth "github.com/cungcung-design/food-delivery-platform/backend/internal/auth"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/cart"
	database "github.com/cungcung-design/food-delivery-platform/backend/internal/database"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/delivery"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/dispatch"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/driver"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/event/consumers"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/menu"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/notification"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/operations"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/order"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/restaurant"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/support"
	"github.com/cungcung-design/food-delivery-platform/backend/internal/tracking"
)

func main() {
	_ = godotenv.Load()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	expiryHours := 24
	if value := os.Getenv("JWT_EXPIRES_HOURS"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			expiryHours = parsed
		}
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.NewPool(ctx, databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal(err)
	}

	queries := db.New(pool)
	hub := tracking.NewHub()

	restaurantService := restaurant.NewService(queries)
	restaurantHandler := restaurant.NewHandler(restaurantService)
	menuService := menu.NewService(queries)
	menuHandler := menu.NewHandler(menuService)
	cartService := cart.NewService(queries)
	cartHandler := cart.NewHandler(cartService)
	deliveryService := delivery.NewService(queries, pool, hub)
	deliveryHandler := delivery.NewHandler(deliveryService, hub)
	orderService := order.NewService(queries, pool, hub)
	orderService.SetPublisher(deliveryService.Publish)
	orderHandler := order.NewHandler(orderService)
	driverService := driver.NewService(queries, deliveryService)
	driverHandler := driver.NewHandler(driverService)
	notificationService := notification.NewService(queries)
	notificationHandler := notification.NewHandler(notificationService)
	aiClient := ai.NewClient("")
	aiLogger := ai.NewLogger(queries)
	aiHandler := ai.NewHandler(aiClient)
	dispatchService := dispatch.NewService(queries, aiClient, aiLogger)
	dispatchHandler := dispatch.NewHandler(dispatchService, queries)
	supportService := support.NewService(queries, orderService, aiClient, aiLogger)
	supportHandler := support.NewHandler(supportService)
	operationsService := operations.NewService(queries, aiClient, aiLogger)
	operationsHandler := operations.NewHandler(operationsService)

	eventRouter := event.NewRouter()
	notificationConsumer := consumers.NewNotificationConsumer(pool, queries)
	dispatchConsumer := consumers.NewDispatchConsumer(pool, queries, dispatchService)
	analyticsConsumer := consumers.NewAnalyticsConsumer(pool, queries)
	eventRouter.Subscribe(event.OrderCreated, notificationConsumer.HandleOrderCreated)
	eventRouter.Subscribe(event.OrderConfirmed, notificationConsumer.HandleOrderConfirmed)
	eventRouter.Subscribe(event.OrderRejected, notificationConsumer.HandleOrderRejected)
	eventRouter.Subscribe(event.OrderPreparing, notificationConsumer.HandleOrderPreparing)
	eventRouter.Subscribe(event.OrderReady, dispatchConsumer.HandleOrderReady)
	eventRouter.Subscribe(event.OrderReady, notificationConsumer.HandleOrderReady)
	eventRouter.Subscribe(event.DriverAssigned, notificationConsumer.HandleDriverAssigned)
	eventRouter.Subscribe(event.OrderPickedUp, notificationConsumer.HandleOrderPickedUp)
	eventRouter.Subscribe(event.OrderOutForDelivery, notificationConsumer.HandleOutForDelivery)
	eventRouter.Subscribe(event.OrderDelivered, notificationConsumer.HandleOrderDelivered)
	eventRouter.Subscribe(event.OrderDelivered, analyticsConsumer.HandleOrderDelivered)
	eventRouter.Subscribe(event.OrderCancelled, notificationConsumer.HandleOrderCancelled)

	workerCtx, cancelWorker := context.WithCancel(context.Background())
	defer cancelWorker()
	go event.NewWorker(queries, eventRouter).Run(workerCtx)

	authService := auth.NewService(queries)
	authHandler := auth.NewHandler(
		authService,
		jwtSecret,
		time.Duration(expiryHours)*time.Hour,
	)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{frontendURL},
		AllowMethods: []string{
			"GET",
			"POST",
			"PATCH",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	router.GET("/", func(c *gin.Context) {
		c.Redirect(302, frontendURL)
	})

	health := func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	}
	router.GET("/health", health)
	// wget --spider and some load balancers probe with HEAD.
	router.HEAD("/health", health)

	auth.RegisterRoutes(router.Group("/api/auth"), authHandler, []byte(jwtSecret))
	restaurant.RegisterRoutes(router, restaurantHandler, []byte(jwtSecret))
	menu.RegisterRoutes(router, menuHandler, []byte(jwtSecret))
	cart.RegisterRoutes(router, cartHandler, []byte(jwtSecret))
	order.RegisterRoutes(router, orderHandler, []byte(jwtSecret))
	driver.RegisterRoutes(router, driverHandler, []byte(jwtSecret))
	delivery.RegisterRoutes(router, deliveryHandler, []byte(jwtSecret))
	notification.RegisterRoutes(router, notificationHandler, []byte(jwtSecret))
	support.RegisterRoutes(router, supportHandler, []byte(jwtSecret))
	dispatch.RegisterRoutes(router, dispatchHandler, []byte(jwtSecret))
	operations.RegisterRoutes(router, operationsHandler, []byte(jwtSecret))
	ai.RegisterRoutes(router, aiHandler, []byte(jwtSecret))

	protected := router.Group("/api/protected", auth.RequireAuth([]byte(jwtSecret)))

	protected.GET("/customer", auth.RequireRole("CUSTOMER"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Customer access granted."})
	})

	protected.GET("/restaurant", auth.RequireRole("RESTAURANT"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Restaurant access granted."})
	})

	protected.GET("/driver", auth.RequireRole("DRIVER"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Driver access granted."})
	})

	protected.GET("/admin", auth.RequireRole("ADMIN"), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Admin access granted."})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API running on :%s", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
