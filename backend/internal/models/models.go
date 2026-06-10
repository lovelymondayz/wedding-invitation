package models

import "time"

type Couple struct {
	ID              string    `json:"id"`
	Slug            string    `json:"slug"`
	GroomName       string    `json:"groom_name"`
	BrideName       string    `json:"bride_name"`
	GroomPhotoURL   string    `json:"groom_photo_url"`
	BridePhotoURL   string    `json:"bride_photo_url"`
	CouplePhotoURL  string    `json:"couple_photo_url"`
	Story           string    `json:"story"`
	Quote           string    `json:"quote"`
	WeddingDate     *string   `json:"wedding_date,omitempty"`
	WeddingTime     *string   `json:"wedding_time,omitempty"`
	CeremonyTime    *string   `json:"ceremony_time,omitempty"`
	ReceptionTime   *string   `json:"reception_time,omitempty"`
	VenueName       string    `json:"venue_name"`
	VenueAddress    string    `json:"venue_address"`
	MapsURL         string    `json:"maps_url"`
	MapsEmbedURL    string    `json:"maps_embed_url"`
	DressCode       string    `json:"dress_code"`
	MusicURL        string    `json:"music_url"`
	PrimaryColor    string    `json:"primary_color"`
	SecondaryColor  string    `json:"secondary_color"`
	BgImageURL      string    `json:"bg_image_url"`
	VideoURL        string    `json:"video_url"`
	VideoType       string    `json:"video_type"`
	IsPublished     bool      `json:"is_published"`
	UpdatedAt       time.Time `json:"updated_at"`
	CreatedAt       time.Time `json:"created_at"`
}

type Admin struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CoupleID     *string   `json:"couple_id"` // nil = super admin
	CreatedAt    time.Time `json:"created_at"`
}

type Guest struct {
	ID                 int        `json:"id"`
	CoupleID           string     `json:"couple_id"`
	FullName           string     `json:"full_name"`
	Slug               string     `json:"slug"`
	Phone              string     `json:"phone"`
	Notes              string     `json:"notes"`
	AttendanceStatus   string     `json:"attendance_status"`
	InvitationSent     bool       `json:"invitation_sent"`
	InvitationOpened   bool       `json:"invitation_opened"`
	InvitationOpenedAt *time.Time `json:"invitation_opened_at,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type RSVP struct {
	ID            int       `json:"id"`
	CoupleID      string    `json:"couple_id"`
	GuestID       *int      `json:"guest_id,omitempty"`
	Name          string    `json:"name"`
	Status        string    `json:"status"`
	AttendeeCount int       `json:"attendee_count"`
	Message       string    `json:"message"`
	CreatedAt     time.Time `json:"created_at"`
}

type Wish struct {
	ID         int       `json:"id"`
	CoupleID   string    `json:"couple_id"`
	GuestName  string    `json:"guest_name"`
	Message    string    `json:"message"`
	IsApproved bool      `json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
}

type GalleryPhoto struct {
	ID           int       `json:"id"`
	CoupleID     string    `json:"couple_id"`
	URL          string    `json:"url"`
	ThumbnailURL string    `json:"thumbnail_url"`
	Caption      string    `json:"caption"`
	SortOrder    int       `json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
}

type MusicTrack struct {
	ID        int       `json:"id"`
	CoupleID  string    `json:"couple_id"`
	Title     string    `json:"title"`
	URL       string    `json:"url"`
	IsActive  bool      `json:"is_active"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

type GiftInfo struct {
	ID              int    `json:"id"`
	CoupleID        string `json:"couple_id"`
	BankName        string `json:"bank_name"`
	AccountNumber   string `json:"account_number"`
	AccountName     string `json:"account_name"`
	QrisImageURL    string `json:"qris_image_url"`
	EwalletProvider string `json:"ewallet_provider"`
	EwalletNumber   string `json:"ewallet_number"`
	SortOrder       int    `json:"sort_order"`
}

type ScheduleEvent struct {
	ID          int    `json:"id"`
	CoupleID    string `json:"couple_id"`
	EventTime   string `json:"event_time"`
	Title       string `json:"title"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

type LoveStoryEvent struct {
	ID          int    `json:"id"`
	CoupleID    string `json:"couple_id"`
	Year        string `json:"year"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	SortOrder   int    `json:"sort_order"`
}
