package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// POST /api/admin/couples/:coupleSlug/gallery
func AdminCreateGalleryHandler(c *gin.Context) {
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
		URL          string `json:"url" binding:"required"`
		ThumbnailURL string `json:"thumbnail_url"`
		Caption      string `json:"caption"`
		SortOrder    int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	var photo models.GalleryPhoto
	err := db.QueryRow(ctx, `INSERT INTO gallery_photos (couple_id, url, thumbnail_url, caption, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id, couple_id, url, thumbnail_url, caption, sort_order, created_at`,
		coupleID, req.URL, req.ThumbnailURL, req.Caption, req.SortOrder,
	).Scan(&photo.ID, &photo.CoupleID, &photo.URL, &photo.ThumbnailURL, &photo.Caption, &photo.SortOrder, &photo.CreatedAt)
	if err != nil {
		utils.Error(c, 500, "Failed to add gallery photo")
		return
	}

	utils.JSON(c, 201, photo)
}

// PUT /api/admin/couples/:coupleSlug/gallery/:id
func AdminUpdateGalleryHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	photoID := c.Param("id")
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
		Caption   string `json:"caption"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	_, err := db.Exec(ctx, "UPDATE gallery_photos SET caption = $1, sort_order = $2 WHERE id = $3 AND couple_id = $4", req.Caption, req.SortOrder, photoID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to update gallery photo")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Gallery photo updated"})
}

// PUT /api/admin/couples/:coupleSlug/gallery/reorder
func AdminReorderGalleryHandler(c *gin.Context) {
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
		Orders []struct {
			ID        int `json:"id"`
			SortOrder int `json:"sort_order"`
		} `json:"orders" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	for _, o := range req.Orders {
		db.Exec(ctx, "UPDATE gallery_photos SET sort_order = $1 WHERE id = $2 AND couple_id = $3", o.SortOrder, o.ID, coupleID)
	}

	utils.JSON(c, 200, gin.H{"message": "Gallery reordered"})
}

// DELETE /api/admin/couples/:coupleSlug/gallery/:id
func AdminDeleteGalleryHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	photoID := c.Param("id")
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

	_, err := db.Exec(ctx, "DELETE FROM gallery_photos WHERE id = $1 AND couple_id = $2", photoID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete gallery photo")
		return
	}

	utils.JSON(c, 200, gin.H{"message": "Gallery photo deleted"})
}
