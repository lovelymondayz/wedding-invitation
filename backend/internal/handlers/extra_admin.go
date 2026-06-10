package handlers

import (
	"context"

	"wedding-api/internal/database"
	"wedding-api/internal/models"
	"wedding-api/internal/utils"

	"github.com/gin-gonic/gin"
)

// ═══════════════════════════════════════════
// GIFT INFO (admin)
// ═══════════════════════════════════════════

func CreateGiftInfoHandler(c *gin.Context) {
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

	var gift models.GiftInfo
	if err := c.ShouldBindJSON(&gift); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}

	err := db.QueryRow(ctx, `INSERT INTO gift_info (couple_id, bank_name, account_number, account_name, qris_image_url, ewallet_provider, ewallet_number, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		coupleID, gift.BankName, gift.AccountNumber, gift.AccountName, gift.QrisImageURL,
		gift.EwalletProvider, gift.EwalletNumber, gift.SortOrder,
	).Scan(&gift.ID)
	if err != nil {
		utils.Error(c, 500, "Failed to create gift info")
		return
	}
	utils.JSON(c, 201, gift)
}

func UpdateGiftInfoHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	giftID := c.Param("id")
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

	var gift models.GiftInfo
	if err := c.ShouldBindJSON(&gift); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}
	_, err := db.Exec(ctx, `UPDATE gift_info SET bank_name=$1, account_number=$2, account_name=$3, qris_image_url=$4, ewallet_provider=$5, ewallet_number=$6, sort_order=$7 WHERE id=$8 AND couple_id=$9`,
		gift.BankName, gift.AccountNumber, gift.AccountName, gift.QrisImageURL,
		gift.EwalletProvider, gift.EwalletNumber, gift.SortOrder, giftID, coupleID,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to update gift info")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Gift info updated"})
}

func DeleteGiftInfoHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	giftID := c.Param("id")
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
	_, err := db.Exec(ctx, "DELETE FROM gift_info WHERE id = $1 AND couple_id = $2", giftID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete gift info")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Gift info deleted"})
}

// ═══════════════════════════════════════════
// SCHEDULE EVENTS (admin)
// ═══════════════════════════════════════════

func CreateScheduleEventHandler(c *gin.Context) {
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

	var event models.ScheduleEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}
	err := db.QueryRow(ctx, `INSERT INTO schedule_events (couple_id, event_time, title, description, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		coupleID, event.EventTime, event.Title, event.Description, event.SortOrder,
	).Scan(&event.ID)
	if err != nil {
		utils.Error(c, 500, "Failed to create schedule event")
		return
	}
	utils.JSON(c, 201, event)
}

func UpdateScheduleEventHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	eventID := c.Param("id")
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

	var event models.ScheduleEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}
	_, err := db.Exec(ctx, `UPDATE schedule_events SET event_time=$1, title=$2, description=$3, sort_order=$4 WHERE id=$5 AND couple_id=$6`,
		event.EventTime, event.Title, event.Description, event.SortOrder, eventID, coupleID,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to update schedule event")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Schedule event updated"})
}

func DeleteScheduleEventHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	eventID := c.Param("id")
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
	_, err := db.Exec(ctx, "DELETE FROM schedule_events WHERE id = $1 AND couple_id = $2", eventID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete schedule event")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Schedule event deleted"})
}

// ═══════════════════════════════════════════
// LOVE STORY EVENTS (admin)
// ═══════════════════════════════════════════

func CreateLoveStoryEventHandler(c *gin.Context) {
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

	var event models.LoveStoryEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}
	err := db.QueryRow(ctx, `INSERT INTO love_story_events (couple_id, year, title, description, icon, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		coupleID, event.Year, event.Title, event.Description, event.Icon, event.SortOrder,
	).Scan(&event.ID)
	if err != nil {
		utils.Error(c, 500, "Failed to create love story event")
		return
	}
	utils.JSON(c, 201, event)
}

func UpdateLoveStoryEventHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	eventID := c.Param("id")
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

	var event models.LoveStoryEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.Error(c, 400, "Invalid request body")
		return
	}
	_, err := db.Exec(ctx, `UPDATE love_story_events SET year=$1, title=$2, description=$3, icon=$4, sort_order=$5 WHERE id=$6 AND couple_id=$7`,
		event.Year, event.Title, event.Description, event.Icon, event.SortOrder, eventID, coupleID,
	)
	if err != nil {
		utils.Error(c, 500, "Failed to update love story event")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Love story event updated"})
}

func DeleteLoveStoryEventHandler(c *gin.Context) {
	coupleSlug := c.Param("coupleSlug")
	eventID := c.Param("id")
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
	_, err := db.Exec(ctx, "DELETE FROM love_story_events WHERE id = $1 AND couple_id = $2", eventID, coupleID)
	if err != nil {
		utils.Error(c, 500, "Failed to delete love story event")
		return
	}
	utils.JSON(c, 200, gin.H{"message": "Love story event deleted"})
}
