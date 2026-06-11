package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"wedding-api/internal/config"
	"wedding-api/internal/database"
	"wedding-api/internal/handlers"
	"wedding-api/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if cfg.DatabaseURL != "" && cfg.DatabaseURL != "skip" {
		if err := database.InitDB(cfg.DatabaseURL); err != nil {
			log.Printf("Warning: Database connection failed: %v", err)
			log.Println("Starting without database — API will return errors for DB operations")
		}
	}

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// Store jwtSecret in context for handlers
	r.Use(func(c *gin.Context) {
		c.Set("jwtSecret", cfg.JWTSecret)
		c.Next()
	})

	// Start background cleanup: delete couples 60 days after wedding
	go startCleanupJob()

	// Static file serving for uploads
	r.Static("/uploads", "./uploads")

	// Health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// ═══════════════════════════════════════════
	// PUBLIC API
	// ═══════════════════════════════════════════
	public := r.Group("/api")
	{
		// Couple creation (from homepage form)
		public.POST("/couples", handlers.CreateCoupleHandler)

		// Couple-scoped public routes
		couple := public.Group("/couples/:coupleSlug")
		{
			couple.GET("", handlers.GetCoupleHandler)
			couple.GET("/countdown", handlers.GetCountdownHandler)
			couple.GET("/guest/:guestSlug", handlers.GetGuestBySlugHandler)
			couple.POST("/guest/:guestSlug/open", handlers.MarkInvitationOpenedHandler)
			couple.POST("/rsvp", handlers.SubmitRSVPHandler)
			couple.POST("/wishes", handlers.SubmitWishHandler)
			couple.GET("/wishes", handlers.ListWishesHandler)
			couple.GET("/gallery", handlers.ListGalleryHandler)
			couple.GET("/music/active", handlers.GetActiveMusicHandler)
			couple.GET("/schedule", handlers.ListScheduleHandler)
			couple.GET("/love-story", handlers.ListLoveStoryHandler)
			couple.GET("/gift", handlers.ListGiftHandler)
		}

		// Auth
		public.POST("/auth/login", handlers.LoginHandler)
	}

	// ═══════════════════════════════════════════
	// ADMIN API (JWT required)
	// ═══════════════════════════════════════════
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		admin.GET("/auth/me", handlers.MeHandler)

		// Super admin: list all couples
		admin.GET("/couples", handlers.AdminListCouplesHandler)
		// Super admin: delete a couple
		admin.DELETE("/couples/:coupleSlug", handlers.AdminDeleteCoupleHandler)

		// Couple-scoped admin routes
		ca := admin.Group("/couples/:coupleSlug")
		{
			// Couple settings
			ca.PUT("", handlers.UpdateCoupleHandler)

			// Guest management
			ca.GET("/guests", handlers.AdminListGuestsHandler)
			ca.POST("/guests", handlers.AdminCreateGuestHandler)
			ca.POST("/guests/import", handlers.AdminImportGuestsHandler)
			ca.GET("/guests/export", handlers.AdminExportGuestsHandler)
			ca.PUT("/guests/:id", handlers.AdminUpdateGuestHandler)
			ca.DELETE("/guests/:id", handlers.AdminDeleteGuestHandler)

			// RSVP management
			ca.GET("/rsvps", handlers.AdminListRSVPsHandler)

			// Wish management
			ca.GET("/wishes", handlers.AdminListWishesHandler)
			ca.PUT("/wishes/:id", handlers.AdminUpdateWishHandler)
			ca.DELETE("/wishes/:id", handlers.AdminDeleteWishHandler)

			// Gallery management
			ca.POST("/gallery", handlers.AdminCreateGalleryHandler)
			ca.PUT("/gallery/:id", handlers.AdminUpdateGalleryHandler)
			ca.PUT("/gallery/reorder", handlers.AdminReorderGalleryHandler)
			ca.DELETE("/gallery/:id", handlers.AdminDeleteGalleryHandler)

			// Music management
			ca.POST("/music", handlers.AdminCreateMusicHandler)
			ca.PUT("/music/:id/activate", handlers.AdminActivateMusicHandler)
			ca.DELETE("/music/:id", handlers.AdminDeleteMusicHandler)

			// Gift info
			ca.POST("/gift", handlers.CreateGiftInfoHandler)
			ca.PUT("/gift/:id", handlers.UpdateGiftInfoHandler)
			ca.DELETE("/gift/:id", handlers.DeleteGiftInfoHandler)

			// Schedule events
			ca.POST("/schedule", handlers.CreateScheduleEventHandler)
			ca.PUT("/schedule/:id", handlers.UpdateScheduleEventHandler)
			ca.DELETE("/schedule/:id", handlers.DeleteScheduleEventHandler)

			// Love story events
			ca.POST("/love-story", handlers.CreateLoveStoryEventHandler)
			ca.PUT("/love-story/:id", handlers.UpdateLoveStoryEventHandler)
			ca.DELETE("/love-story/:id", handlers.DeleteLoveStoryEventHandler)

			// Analytics
			ca.GET("/analytics", handlers.AnalyticsHandler)

			// File upload
			ca.POST("/upload", func(c *gin.Context) {
				file, err := c.FormFile("file")
				if err != nil {
					c.JSON(400, gin.H{"error": "No file uploaded"})
					return
				}

				uploadDir := "./uploads"
				os.MkdirAll(uploadDir, 0755)
				filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
				filepath := fmt.Sprintf("%s/%s", uploadDir, filename)

				if err := c.SaveUploadedFile(file, filepath); err != nil {
					c.JSON(500, gin.H{"error": "Failed to save file"})
					return
				}

				c.JSON(200, gin.H{
					"url":  "/uploads/" + filename,
					"name": file.Filename,
				})
			})
		}
	}

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// startCleanupJob runs daily and deletes couples whose wedding was 60+ days ago
func startCleanupJob() {
	const cleanupInterval = 24 * time.Hour

	for {
		if err := cleanupExpiredCouples(); err != nil {
			log.Printf("Cleanup job error: %v", err)
		}
		time.Sleep(cleanupInterval)
	}
}

func cleanupExpiredCouples() error {
	ctx := context.Background()
	db := database.GetDB()

	// Find couples with wedding_date < NOW() - 60 days
	rows, err := db.Query(ctx, `
		SELECT id, slug, groom_name, bride_name, wedding_date::text
		FROM couples
		WHERE wedding_date IS NOT NULL
		  AND wedding_date < (CURRENT_DATE - INTERVAL '60 days')
	`)
	if err != nil {
		return fmt.Errorf("query expired couples: %w", err)
	}
	defer rows.Close()

	var deleted int
	for rows.Next() {
		var id, slug, groomName, brideName, weddingDate string
		if err := rows.Scan(&id, &slug, &groomName, &brideName, &weddingDate); err != nil {
			continue
		}

		// Delete cascades to all child tables (guests, rsvps, wishes, gallery, etc.)
		_, err := db.Exec(ctx, "DELETE FROM couples WHERE id = $1", id)
		if err != nil {
			log.Printf("Failed to delete couple %s (%s): %v", slug, id, err)
			continue
		}

		deleted++
		log.Printf("Auto-deleted couple: %s & %s (wedding: %s, slug: %s)", groomName, brideName, weddingDate, slug)
	}

	if deleted > 0 {
		log.Printf("Cleanup complete: %d expired couple(s) deleted", deleted)
	}
	return nil
}
