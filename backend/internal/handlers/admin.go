package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// GET /api/admin/couples/:coupleSlug/rsvps
func AdminListRSVPsHandler(c *gin.Context) {
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

	rows, err := db.Query(ctx, "SELECT id, couple_id, guest_id, name, status, attendee_count, message, created_at FROM rsvps WHERE couple_id = $1 ORDER BY created_at DESC", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch RSVPs")
		return
	}
	defer rows.Close()

	rsvps := []models.RSVP{}
	for rows.Next() {
		var r models.RSVP
		if err := rows.Scan(&r.ID, &r.CoupleID, &r.GuestID, &r.Name, &r.Status, &r.AttendeeCount, &r.Message, &r.CreatedAt); err != nil {
			continue
		}
		rsvps = append(rsvps, r)
	}

	var total, attending, notAttending, pending int
	db.QueryRow(ctx, "SELECT COUNT(*) FROM rsvps WHERE couple_id = $1", coupleID).Scan(&total)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM rsvps WHERE couple_id = $1 AND status = 'attending'", coupleID).Scan(&attending)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM rsvps WHERE couple_id = $1 AND status = 'not_attending'", coupleID).Scan(&notAttending)
	db.QueryRow(ctx, "SELECT COUNT(*) FROM guests WHERE couple_id = $1 AND attendance_status = 'pending'", coupleID).Scan(&pending)

	utils.JSON(c, 200, gin.H{
		"data":           rsvps,
		"total":          total,
		"attending":      attending,
		"not_attending":  notAttending,
		"pending":        pending,
	})
}
