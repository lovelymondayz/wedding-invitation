package handlers

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadResult represents a single file upload result
type UploadResult struct {
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	Error    string `json:"error,omitempty"`
}

// POST /api/admin/couples/:coupleSlug/upload
// Batch upload: accepts multipart/form-data with multiple files in "images" field
func BatchUploadHandler(c *gin.Context) {
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

	// Parse multipart form with 32MB limit
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		utils.Error(c, 400, "Failed to parse form (max 32MB)")
		return
	}

	files := c.Request.MultipartForm.File["images"]
	if len(files) == 0 {
		utils.Error(c, 400, "No images uploaded (field name: images)")
		return
	}

	if len(files) > 10 {
		utils.Error(c, 400, "Maximum 10 images per upload")
		return
	}

	// Create upload directory for this couple
	uploadDir := fmt.Sprintf("./uploads/%s", coupleSlug)
	os.MkdirAll(uploadDir, 0755)

	results := make([]UploadResult, 0, len(files))
	uploadedPhotos := []models.GalleryPhoto{}

	for _, file := range files {
		result := processUpload(file, uploadDir, coupleSlug, coupleID, ctx)
		results = append(results, result)
		if result.Error == "" {
			// Insert into DB
			var photo models.GalleryPhoto
			err := db.QueryRow(ctx, `INSERT INTO gallery_photos (couple_id, url, thumbnail_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, couple_id, url, thumbnail_url, caption, sort_order, created_at`,
				coupleID, result.URL, result.URL, len(uploadedPhotos),
			).Scan(&photo.ID, &photo.CoupleID, &photo.URL, &photo.ThumbnailURL, &photo.Caption, &photo.SortOrder, &photo.CreatedAt)
			if err == nil {
				uploadedPhotos = append(uploadedPhotos, photo)
			} else {
				result.Error = fmt.Sprintf("File saved but DB insert failed: %v", err)
			}
		}
	}

	utils.JSON(c, 200, gin.H{
		"results": results,
		"photos":  uploadedPhotos,
	})
}

func processUpload(file *multipart.FileHeader, uploadDir string, coupleSlug string, coupleID string, ctx context.Context) UploadResult {
	result := UploadResult{
		Filename: file.Filename,
		Size:     file.Size,
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	validExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}
	if !validExts[ext] {
		result.Error = fmt.Sprintf("Invalid file type: %s (allowed: jpg, png, webp, gif)", ext)
		return result
	}

	// Validate file size (5MB per file)
	if file.Size > 5<<20 {
		result.Error = fmt.Sprintf("File too large: %s (max 5MB per file)", file.Filename)
		return result
	}

	// Generate UUID filename
	newFilename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	filepath := fmt.Sprintf("%s/%s", uploadDir, newFilename)

	// Save file
	f, err := file.Open()
	if err != nil {
		result.Error = "Failed to read file"
		return result
	}
	defer f.Close()

	out, err := os.Create(filepath)
	if err != nil {
		result.Error = "Failed to create file on disk"
		return result
	}
	defer out.Close()

	buf := make([]byte, 1024)
	for {
		n, err := f.Read(buf)
		if n > 0 {
			out.Write(buf[:n])
		}
		if err != nil {
			break
		}
	}

	result.URL = fmt.Sprintf("/uploads/%s/%s", coupleSlug, newFilename)
	return result
}
