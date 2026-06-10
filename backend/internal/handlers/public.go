package handlers

import (
	"context"
	"fmt"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// resolveCoupleSlug looks up couple by slug and returns (id, ok)
func resolveCoupleSlug(ctx context.Context, slug string) (string, bool) {
	var id string
	err := database.GetDB().QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", slug).Scan(&id)
	if err != nil {
		return "", false
	}
	return id, true
}

// ═══════════════════════════════════════════
// COUPLE SETTINGS
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug
func GetCoupleHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var couple models.Couple
	err := db.QueryRow(ctx, `SELECT id, slug, groom_name, bride_name, groom_photo_url, bride_photo_url, couple_photo_url, story, quote, wedding_date::text, wedding_time::text, ceremony_time::text, reception_time::text, venue_name, venue_address, maps_url, maps_embed_url, dress_code, music_url, primary_color, secondary_color, bg_image_url, video_url, video_type, is_published, updated_at, created_at FROM couples WHERE slug = $1`, coupleSlug).Scan(
		&couple.ID, &couple.Slug, &couple.GroomName, &couple.BrideName, &couple.GroomPhotoURL,
		&couple.BridePhotoURL, &couple.CouplePhotoURL, &couple.Story, &couple.Quote,
		&couple.WeddingDate, &couple.WeddingTime, &couple.CeremonyTime, &couple.ReceptionTime,
		&couple.VenueName, &couple.VenueAddress, &couple.MapsURL, &couple.MapsEmbedURL,
		&couple.DressCode, &couple.MusicURL, &couple.PrimaryColor, &couple.SecondaryColor,
		&couple.BgImageURL, &couple.VideoURL, &couple.VideoType, &couple.IsPublished,
		&couple.UpdatedAt, &couple.CreatedAt,
	)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	utils.JSON(c, 200, couple)
}

// GET /api/couples/:coupleSlug/countdown
func GetCountdownHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var weddingDate, weddingTime, ceremonyTime, receptionTime *string
	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	err = db.QueryRow(ctx, "SELECT wedding_date::text, wedding_time::text, ceremony_time::text, reception_time::text FROM couples WHERE id = $1", coupleID).Scan(
		&weddingDate, &weddingTime, &ceremonyTime, &receptionTime,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch countdown info")
		return
	}

	utils.JSON(c, 200, gin.H{
		"wedding_date":   weddingDate,
		"wedding_time":   weddingTime,
		"ceremony_time":  ceremonyTime,
		"reception_time": receptionTime,
	})
}

// ═══════════════════════════════════════════
// GUEST (public)
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/guest/:guestSlug
func GetGuestBySlugHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	guestSlug := c.Param("guestSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	var guest models.Guest
	err = db.QueryRow(ctx, "SELECT id, couple_id, full_name, slug, phone, notes, attendance_status, invitation_sent, invitation_opened, invitation_opened_at, created_at, updated_at FROM guests WHERE couple_id = $1 AND slug = $2", coupleID, guestSlug).Scan(
		&guest.ID, &guest.CoupleID, &guest.FullName, &guest.Slug, &guest.Phone, &guest.Notes,
		&guest.AttendanceStatus, &guest.InvitationSent, &guest.InvitationOpened,
		&guest.InvitationOpenedAt, &guest.CreatedAt, &guest.UpdatedAt,
	)
	if err != nil {
		utils.Error(c, 404, "Guest not found")
		return
	}

	utils.JSON(c, 200, guest)
}

// POST /api/couples/:coupleSlug/guest/:guestSlug/open
func MarkInvitationOpenedHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	guestSlug := c.Param("guestSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	now := time.Now().UTC()
	result, err := db.Exec(ctx, "UPDATE guests SET invitation_opened = true, invitation_opened_at = $1 WHERE couple_id = $2 AND slug = $3 AND invitation_opened = false", now, coupleID, guestSlug)
	if err != nil {
		utils.Error(c, 500, "Failed to mark invitation as opened")
		return
	}

	if result.RowsAffected() == 0 {
		var exists bool
		db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM guests WHERE couple_id = $1 AND slug = $2)", coupleID, guestSlug).Scan(&exists)
		if !exists {
			utils.Error(c, 404, "Guest not found")
			return
		}
	}

	utils.JSON(c, 200, gin.H{"message": "Invitation marked as opened"})
}

// ═══════════════════════════════════════════
// RSVP
// ═══════════════════════════════════════════

// POST /api/couples/:coupleSlug/rsvp
func SubmitRSVPHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	var req struct {
		GuestID       *int   `json:"guest_id"`
		Name          string `json:"name" binding:"required"`
		Status        string `json:"status" binding:"required"`
		AttendeeCount int    `json:"attendee_count"`
		Message       string `json:"message"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	if req.AttendeeCount < 1 {
		req.AttendeeCount = 1
	}

	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	var rsvpID int
	err = db.QueryRow(ctx, `INSERT INTO rsvps (couple_id, guest_id, name, status, attendee_count, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		coupleID, req.GuestID, req.Name, req.Status, req.AttendeeCount, req.Message,
	).Scan(&rsvpID)
	if err != nil {
		utils.Error(c, 500, "Failed to submit RSVP")
		return
	}

	if req.GuestID != nil {
		db.Exec(ctx, "UPDATE guests SET attendance_status = $1 WHERE id = $2 AND couple_id = $3", req.Status, *req.GuestID, coupleID)
	}

	utils.JSON(c, 201, gin.H{"id": rsvpID, "message": "RSVP submitted successfully"})
}

// ═══════════════════════════════════════════
// WISHES
// ═══════════════════════════════════════════

// POST /api/couples/:coupleSlug/wishes
func SubmitWishHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	var req struct {
		GuestName string `json:"guest_name" binding:"required"`
		Message   string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	var wishID int
	err = db.QueryRow(ctx, `INSERT INTO wishes (couple_id, guest_name, message, is_approved) VALUES ($1, $2, $3, true) RETURNING id`,
		coupleID, req.GuestName, req.Message,
	).Scan(&wishID)
	if err != nil {
		utils.Error(c, 500, "Failed to submit wish")
		return
	}

	utils.JSON(c, 201, gin.H{"id": wishID, "message": "Wish submitted successfully"})
}

// GET /api/couples/:coupleSlug/wishes
func ListWishesHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, guest_name, message, is_approved, created_at FROM wishes WHERE couple_id = $1 AND is_approved = true ORDER BY created_at DESC", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch wishes")
		return
	}
	defer rows.Close()

	wishes := []models.Wish{}
	for rows.Next() {
		var w models.Wish
		if err := rows.Scan(&w.ID, &w.CoupleID, &w.GuestName, &w.Message, &w.IsApproved, &w.CreatedAt); err != nil {
			continue
		}
		wishes = append(wishes, w)
	}

	utils.JSON(c, 200, wishes)
}

// ═══════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/gallery
func ListGalleryHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, url, thumbnail_url, caption, sort_order, created_at FROM gallery_photos WHERE couple_id = $1 ORDER BY sort_order", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch gallery")
		return
	}
	defer rows.Close()

	photos := []models.GalleryPhoto{}
	for rows.Next() {
		var p models.GalleryPhoto
		if err := rows.Scan(&p.ID, &p.CoupleID, &p.URL, &p.ThumbnailURL, &p.Caption, &p.SortOrder, &p.CreatedAt); err != nil {
			continue
		}
		photos = append(photos, p)
	}

	utils.JSON(c, 200, photos)
}

// ═══════════════════════════════════════════
// MUSIC
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/music/active
func GetActiveMusicHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	var track models.MusicTrack
	err = db.QueryRow(ctx, "SELECT id, couple_id, title, url, is_active, sort_order, created_at FROM music_tracks WHERE couple_id = $1 AND is_active = true LIMIT 1", coupleID).Scan(
		&track.ID, &track.CoupleID, &track.Title, &track.URL, &track.IsActive, &track.SortOrder, &track.CreatedAt,
	)
	if err != nil {
		utils.Error(c, 404, "No active music track found")
		return
	}

	utils.JSON(c, 200, track)
}

// ═══════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/schedule
func ListScheduleHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, event_time, title, description, sort_order FROM schedule_events WHERE couple_id = $1 ORDER BY sort_order", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch schedule")
		return
	}
	defer rows.Close()

	events := []models.ScheduleEvent{}
	for rows.Next() {
		var e models.ScheduleEvent
		if err := rows.Scan(&e.ID, &e.CoupleID, &e.EventTime, &e.Title, &e.Description, &e.SortOrder); err != nil {
			continue
		}
		events = append(events, e)
	}

	utils.JSON(c, 200, events)
}

// ═══════════════════════════════════════════
// LOVE STORY
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/love-story
func ListLoveStoryHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, year, title, description, icon, sort_order FROM love_story_events WHERE couple_id = $1 ORDER BY sort_order", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch love story")
		return
	}
	defer rows.Close()

	events := []models.LoveStoryEvent{}
	for rows.Next() {
		var e models.LoveStoryEvent
		if err := rows.Scan(&e.ID, &e.CoupleID, &e.Year, &e.Title, &e.Description, &e.Icon, &e.SortOrder); err != nil {
			continue
		}
		events = append(events, e)
	}

	utils.JSON(c, 200, events)
}

// ═══════════════════════════════════════════
// GIFT
// ═══════════════════════════════════════════

// GET /api/couples/:coupleSlug/gift
func ListGiftHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	ctx := context.Background()
	db := database.GetDB()

	var coupleID string
	err := db.QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", coupleSlug).Scan(&coupleID)
	if err != nil {
		utils.Error(c, 404, "Couple not found")
		return
	}

	rows, err := db.Query(ctx, "SELECT id, couple_id, bank_name, account_number, account_name, qris_image_url, ewallet_provider, ewallet_number, sort_order FROM gift_info WHERE couple_id = $1 ORDER BY sort_order", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch gift info")
		return
	}
	defer rows.Close()

	gifts := []models.GiftInfo{}
	for rows.Next() {
		var g models.GiftInfo
		if err := rows.Scan(&g.ID, &g.CoupleID, &g.BankName, &g.AccountNumber, &g.AccountName, &g.QrisImageURL, &g.EwalletProvider, &g.EwalletNumber, &g.SortOrder); err != nil {
			continue
		}
		gifts = append(gifts, g)
	}

	utils.JSON(c, 200, gifts)
}

// ensure unused import
var _ = fmt.Sprintf
