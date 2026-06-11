package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
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
		utils.Error(c, 500, "Failed to fetch couples")
		return
	}
	defer rows.Close()

	type CoupleListItem struct {
		ID             string `json:"id"`
		Slug           string `json:"slug"`
		GroomName      string `json:"groom_name"`
		BrideName      string `json:"bride_name"`
		WeddingDate    string `json:"wedding_date"`
		VenueName      string `json:"venue_name"`
		IsPublished    bool   `json:"is_published"`
		GuestCount     int    `json:"guest_count"`
		AttendingCount int    `json:"attending_count"`
		CreatedAt      string `json:"created_at"`
	}

	couples := []CoupleListItem{}
	for rows.Next() {
		var item CoupleListItem
		var weddingDate *string
		if err := rows.Scan(&item.ID, &item.Slug, &item.GroomName, &item.BrideName, &weddingDate, &item.VenueName, &item.IsPublished, &item.CreatedAt, &item.GuestCount, &item.AttendingCount); err != nil {
			continue
		}
		if weddingDate != nil {
			item.WeddingDate = *weddingDate
		}
		couples = append(couples, item)
	}

	utils.JSON(c, 200, couples)
}

// ensure models import used
var _ = models.Couple{}
