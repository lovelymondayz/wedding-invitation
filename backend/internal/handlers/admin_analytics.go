package handlers

import (
	"context"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// GET /api/admin/couples/:coupleSlug/analytics
func AnalyticsHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	coupleID, ok := getCoupleIDFromSlug(ctx, coupleSlug)
	if !ok {
		utils.Error(c, 404, "Couple not found")
		return
	}

	if !authorizeCoupleAccess(c, coupleID) {
		utils.Error(c, 403, "Access denied")
		return
	}

	var totalGuests, attending, notAttending, pending, totalRSVPs, totalWishes, galleryCount int

	db.QueryRow(ctx, "SELECT COUNT(*) FROM guests WHERE couple_id = $1", coupleID).Scan(&totalGuests)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM guests WHERE couple_id = $1 AND attendance_status = 'attending'", coupleID).Scan(&attending)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM guests WHERE couple_id = $1 AND attendance_status = 'not_attending'", coupleID).Scan(&notAttending)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM guests WHERE couple_id = $1 AND attendance_status = 'pending'", coupleID).Scan(&pending)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM rsvps WHERE couple_id = $1", coupleID).Scan(&totalRSVPs)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM wishes WHERE couple_id = $1", coupleID).Scan(&totalWishes)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM gallery_photos WHERE couple_id = $1", coupleID).Scan(&galleryCount)

	recentOpened := []gin.H{}
	rows, _ := db.Query(ctx, "SELECT full_name, invitation_opened_at FROM guests WHERE couple_id = $1 AND invitation_opened = true ORDER BY invitation_opened_at DESC LIMIT 5", coupleID)
	defer rows.Close()
	for rows.Next() {
		var name string
		var openedAt *time.Time
		if err := rows.Scan(&name, &openedAt); err == nil {
			recentOpened = append(recentOpened, gin.H{"name": name, "opened_at": openedAt})
		}
	}

	utils.JSON(c, 200, gin.H{
		"total_guests":  totalGuests,
		"attending":     attending,
		"not_attending": notAttending,
		"pending":       pending,
		"total_rsvps":   totalRSVPs,
		"total_wishes":  totalWishes,
		"gallery_count": galleryCount,
		"recent_opened": recentOpened,
	})
}
