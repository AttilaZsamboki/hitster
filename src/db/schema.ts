import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	status: text("status").notNull().default("waiting"),
	currentPlayerId: integer("current_player_id").references(() => players.id),
	packageId: integer("package_id").references(() => songPackages.id),
	maxSongs: integer("max_songs").default(10),
	packageLocked: boolean("package_locked").default(false),
	createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	sessionId: integer("session_id"),
	score: integer("score").default(0),
	createdAt: timestamp("created_at").defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	currentPlayer: one(players, {
		fields: [sessions.currentPlayerId],
		references: [players.id],
	}),
	players: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
	session: one(sessions, {
		fields: [players.sessionId],
		references: [sessions.id],
	}),
}));

export const timelines = pgTable("timelines", {
	id: serial("id").primaryKey(),
	playerId: integer("player_id").references(() => players.id, { onDelete: "cascade" }),
	songTitle: text("song_title").notNull(),
	songArtist: text("song_artist").notNull(),
	songYear: integer("song_year").notNull(),
	position: integer("position").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const currentSongs = pgTable("current_songs", {
	id: serial("id").primaryKey(),
	sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
	songTitle: text("song_title").notNull(),
	songArtist: text("song_artist").notNull(),
	songYear: integer("song_year").notNull(),
	previewUrl: text("preview_url"),
	spotifyUrl: text("spotify_url"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const songPackages = pgTable("song_packages", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const songs = pgTable("songs", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	artist: text("artist").notNull(),
	released: text("released").notNull(),
	genre: text("genre"),
	country: text("country"),
	rank: integer("rank"),
	songArtistCredit: text("song_artist_credit"),
	cspc: integer("cspc"),
	album: text("album"),
	artistSpotifyId: text("artist_spotify_id"),
});

export const usedSongs = pgTable("used_songs", {
	id: serial("id").primaryKey(),
	sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
	songTitle: text("song_title").notNull(),
	songArtist: text("song_artist").notNull(),
	songYear: integer("song_year").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
