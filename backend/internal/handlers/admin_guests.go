package handlers

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Helper: get couple_id from slug, returns (coupleID, ok)
func getCoupleIDFromSlug(ctx context.Context, slug string) (string, bool) {
	var id string
	err := database.GetDB().QueryRow(ctx, "SELECT id FROM couples WHERE slug = $1", slug).Scan(&id)
	if err != nil {
		return "", false
	}
	return id, true
}

// Helper: verify admin can access this couple (super admin can access any)
func authorizeCoupleAccess(c *gin.Context, coupleID string) bool {
	role, _ := c.Get("role")
	if role == "super" {
		return true
	}
	adminCoupleID, _ := c.Get("coupleID")
	return adminCoupleID == coupleID
}

// ═══════════════════════════════════════════
// COUPLE SETTINGS (admin)
// ═══════════════════════════════════════════

// PUT /api/admin/couples/:coupleSlug
func UpdateCoupleHandler(c *gin.Context) {
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

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	allowedFields := map[string]bool{
		"groom_name": true, "bride_name": true, "groom_photo_url": true,
		"bride_photo_url": true, "couple_photo_url": true, "story": true,
		"quote": true, "wedding_date": true, "wedding_time": true,
		"ceremony_time": true, "reception_time": true, "venue_name": true,
		"venue_address": true, "maps_url": true, "maps_embed_url": true,
		"dress_code": true, "music_url": true, "primary_color": true,
		"secondary_color": true, "bg_image_url": true, "video_url": true,
		"video_type": true, "is_published": true,
	}

	setParts := []string{}
	args := []interface{}{}
	argIdx := 2 // $1 is for WHERE id=$1

	for key, value := range updates {
		if allowedFields[key] {
			setParts = append(setParts, fmt.Sprintf("%s = $%d", key, argIdx))
			args = append(args, value)
			argIdx++
		}
	}

	if len(setParts) == 0 {
		utils.Error(c, 400, "No valid fields to update")
		return
	}

	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIdx))
	args = append(args, time.Now().UTC())
	argIdx++

	query := "UPDATE couples SET "
	for i, part := range setParts {
		if i > 0 {
			query += ", "
		}
		query += part
	}
	query += " WHERE id = $1"

	args = append([]interface{}{coupleID}, args...)

	_, err := db.Exec(ctx, query, args...)
	if err != nil {
		utils.Error(c, 500, "Failed to update couple settings: "+err.Error())
		return
	}

	// Return updated
	var couple models.Couple
	err = db.QueryRow(ctx, `SELECT id, slug, groom_name, bride_name, groom_photo_url, bride_photo_url, couple_photo_url, story, quote, wedding_date::text, wedding_time::text, ceremony_time::text, reception_time::text, venue_name, venue_address, maps_url, maps_embed_url, dress_code, music_url, primary_color, secondary_color, bg_image_url, video_url, video_type, is_published, updated_at, created_at FROM couples WHERE id = $1`, coupleID).Scan(
		&couple.ID, &couple.Slug, &couple.GroomName, &couple.BrideName, &couple.GroomPhotoURL,
		&couple.BridePhotoURL, &couple.CouplePhotoURL, &couple.Story, &couple.Quote,
		&couple.WeddingDate, &couple.WeddingTime, &couple.CeremonyTime, &couple.ReceptionTime,
		&couple.VenueName, &couple.VenueAddress, &couple.MapsURL, &couple.MapsEmbedURL,
		&couple.DressCode, &couple.MusicURL, &couple.PrimaryColor, &couple.SecondaryColor,
		&couple.BgImageURL, &couple.VideoURL, &couple.VideoType, &couple.IsPublished,
		&couple.UpdatedAt, &couple.CreatedAt,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch updated settings")
		return
	}

	utils.JSON(c, 200, couple)
}

// ═══════════════════════════════════════════
// GUEST CRUD (admin)
// ═══════════════════════════════════════════

// GET /api/admin/couples/:coupleSlug/guests?page=1&limit=20&search=
func AdminListGuestsHandler(c *gin.Context) {
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

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	query := "SELECT id, couple_id, full_name, slug, phone, notes, attendance_status, invitation_sent, invitation_opened, invitation_opened_at, created_at, updated_at FROM guests WHERE couple_id = $1"
	countQuery := "SELECT COUNT(*) FROM guests WHERE couple_id = $1"
	args := []interface{}{coupleID}

	if search != "" {
		query += " AND full_name ILIKE $2"
		countQuery += " AND full_name ILIKE $2"
		args = append(args, "%"+search+"%")
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	var total int
	err := db.QueryRow(ctx, countQuery, args[:len(args)-2]...).Scan(&total)
	if err != nil {
		utils.Error(c, 500, "Failed to count guests")
		return
	}

	rows, err := db.Query(ctx, query, args...)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch guests")
		return
	}
	defer rows.Close()

	guests := []models.Guest{}
	for rows.Next() {
		var g models.Guest
		if err := rows.Scan(&g.ID, &g.CoupleID, &g.FullName, &g.Slug, &g.Phone, &g.Notes, &g.AttendanceStatus, &g.InvitationSent, &g.InvitationOpened, &g.InvitationOpenedAt, &g.CreatedAt, &g.UpdatedAt); err != nil {
			continue
		}
		guests = append(guests, g)
	}

	utils.JSON(c, 200, gin.H{
		"data":  guests,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// POST /api/admin/couples/:coupleSlug/guests
func AdminCreateGuestHandler(c *gin.Context) {
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

	var req struct {
		FullName string `json:"full_name" binding:"required"`
		Phone    string `json:"phone"`
		Notes    string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	slug := utils.Slugify(req.FullName) + "-" + uuid.New().String()[:8]

	var guest models.Guest
	err := db.QueryRow(ctx, `INSERT INTO guests (couple_id, full_name, slug, phone, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, couple_id, full_name, slug, phone, notes, attendance_status, invitation_sent, invitation_opened, created_at, updated_at`,
		coupleID, req.FullName, slug, req.Phone, req.Notes,
	).Scan(&guest.ID, &guest.CoupleID, &guest.FullName, &guest.Slug, &guest.Phone, &guest.Notes, &guest.AttendanceStatus, &guest.InvitationSent, &guest.InvitationOpened, &guest.CreatedAt, &guest.UpdatedAt)
	if err != nil {
		utils.Error(c, 500, "Failed to create guest")
		return
	}

	utils.JSON(c, 201, guest)
}

// POST /api/admin/couples/:coupleSlug/guests/import
func AdminImportGuestsHandler(c *gin.Context) {
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

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		utils.Error(c, 400, "Failed to read request body")
		return
	}

	reader := csv.NewReader(strings.NewReader(string(body)))
	records, err := reader.ReadAll()
	if err != nil {
		utils.Error(c, 400, "Failed to parse CSV")
		return
	}

	if len(records) < 2 {
		utils.Error(c, 400, "CSV must have a header row and at least one data row")
		return
	}

	imported := 0
	errors := []string{}

	for i, record := range records[1:] {
		if len(record) < 1 || strings.TrimSpace(record[0]) == "" {
			errors = append(errors, fmt.Sprintf("Row %d: empty name", i+2))
			continue
		}

		fullName := strings.TrimSpace(record[0])
		phone := ""
		notes := ""
		if len(record) > 1 {
			phone = strings.TrimSpace(record[1])
		}
		if len(record) > 2 {
			notes = strings.TrimSpace(record[2])
		}

		slug := utils.Slugify(fullName) + "-" + uuid.New().String()[:8]

		_, err := db.Exec(ctx, `INSERT INTO guests (couple_id, full_name, slug, phone, notes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (couple_id, slug) DO NOTHING`,
			coupleID, fullName, slug, phone, notes,
		)
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: %v", i+2, err))
			continue
		}
		imported++
	}

	utils.JSON(c, 200, gin.H{
		"imported": imported,
		"errors":   errors,
	})
}

// GET /api/admin/couples/:coupleSlug/guests/export
func AdminExportGuestsHandler(c *gin.Context) {
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

	rows, err := db.Query(ctx, "SELECT full_name, slug, phone, notes, attendance_status, invitation_sent, invitation_opened, created_at FROM guests WHERE couple_id = $1 ORDER BY created_at", coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to fetch guests")
		return
	}
	defer rows.Close()

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=guests.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	writer.Write([]string{"full_name", "slug", "phone", "notes", "attendance_status", "invitation_sent", "invitation_opened", "created_at"})

	for rows.Next() {
		var g models.Guest
		if err := rows.Scan(&g.FullName, &g.Slug, &g.Phone, &g.Notes, &g.AttendanceStatus, &g.InvitationSent, &g.InvitationOpened, &g.CreatedAt); err != nil {
			continue
		}
		writer.Write([]string{
			g.FullName, g.Slug, g.Phone, g.Notes, g.AttendanceStatus,
			strconv.FormatBool(g.InvitationSent),
			strconv.FormatBool(g.InvitationOpened),
			g.CreatedAt.Format(time.RFC3339),
		})
	}
}

// PUT /api/admin/couples/:coupleSlug/guests/:id
func AdminUpdateGuestHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	guestID := c.Param("id")
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

	var req struct {
		FullName         string `json:"full_name"`
		Phone            string `json:"phone"`
		Notes            string `json:"notes"`
		AttendanceStatus string `json:"attendance_status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	_, err := db.Exec(ctx, `UPDATE guests SET full_name = COALESCE(NULLIF($1, ''), full_name), phone = $2, notes = $3, attendance_status = COALESCE(NULLIF($4, ''), attendance_status), updated_at = $5 WHERE id = $6 AND couple_id = $7`,
		req.FullName, req.Phone, req.Notes, req.AttendanceStatus, time.Now().UTC(), guestID, coupleID,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to update guest")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Guest updated"})
}

// DELETE /api/admin/couples/:coupleSlug/guests/:id
func AdminDeleteGuestHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	guestID := c.Param("id")
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

	_, err := db.Exec(ctx, "DELETE FROM guests WHERE id = $1 AND couple_id = $2", guestID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete guest")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Guest deleted"})
}
