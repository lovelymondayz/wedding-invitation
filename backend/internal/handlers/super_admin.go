package handlers

import (
	"context"
	"fmt"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// GET /api/admin/couples — List all couples (super admin only)
func AdminListCouplesHandler(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "super" {
		utils.Error(c, 403, "Super admin access required")
		return
	}

	ctx := context.Background()
	db := database.GetDB()

	rows, err := db.Query(ctx, `
		SELECT c.id, c.slug, c.groom_name, c.bride_name, c.wedding_date::text, c.venue_name, c.is_published, c.created_at,
		       COUNT(g.id) as guest_count,
		       COUNT(CASE WHEN g.attendance_status = 'attending' THEN 1 END) as attending_count
		FROM couples c
		LEFT JOIN guests g ON g.couple_id = c.id
		GROUP BY c.id
		ORDER BY c.created_at DESC
	`)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch couples: "+err.Error())
		return
	}
	defer rows.Close()

	type CoupleListItem struct {
		ID             string    `json:"id"`
		Slug           string    `json:"slug"`
		GroomName      string    `json:"groom_name"`
		BrideName      string    `json:"bride_name"`
		WeddingDate    string    `json:"wedding_date"`
		VenueName      string    `json:"venue_name"`
		IsPublished    bool      `json:"is_published"`
		GuestCount     int       `json:"guest_count"`
		AttendingCount int       `json:"attending_count"`
		CreatedAt      time.Time `json:"created_at"`
	}

	couples := []CoupleListItem{}
	for rows.Next() {
		var item CoupleListItem
		var weddingDate *string
		if err := rows.Scan(&item.ID, &item.Slug, &item.GroomName, &item.BrideName, &weddingDate, &item.VenueName, &item.IsPublished, &item.CreatedAt, &item.GuestCount, &item.AttendingCount); err != nil {
			fmt.Printf("Scan error: %v\n", err)
			continue
		}
		if weddingDate != nil {
			item.WeddingDate = *weddingDate
		}
		couples = append(couples, item)
	}

	utils.JSON(c, 200, couples)
}

// DELETE /api/admin/couples/:coupleSlug — Delete a couple and all cascaded data (super admin only)
func AdminDeleteCoupleHandler(c *gin.Context) {
	role, _ := c.Get("role")
	if role != "super" {
		utils.Error(c, 403, "Super admin access required")
		return
	}

	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	// Get couple ID for logging
	var coupleID string
	var groomName, brideName string
	err := db.QueryRow(ctx, "SELECT id, groom_name, bride_name FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID, &groomName, &brideName)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	// Delete couple — CASCADE removes guests, rsvps, wishes, gallery, music, gifts, schedule, love story
	_, err = db.Exec(ctx, "DELETE FROM couples WHERE id = $1", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete couple: "+err.Error())
		return
	}

	fmt.Printf("Super admin deleted couple: %s & %s (slug: %s)\n", groomName, brideName, coupleSlug)
	utils.JSON(c, 200, gin.H{"message": "Couple deleted successfully"})
}
