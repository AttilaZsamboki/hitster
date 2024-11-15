import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	status: text("status").notNull().default("active"),
	currentPlayerId: integer("current_player_id"),
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
	playerId: integer("player_id").references(() => players.id),
	songTitle: text("song_title").notNull(),
	songArtist: text("song_artist").notNull(),
	songYear: integer("song_year").notNull(),
	position: integer("position").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const currentSongs = pgTable("current_songs", {
	id: serial("id").primaryKey(),
	sessionId: integer("session_id").references(() => sessions.id),
	songTitle: text("song_title").notNull(),
	songArtist: text("song_artist").notNull(),
	songYear: integer("song_year").notNull(),
	previewUrl: text("preview_url"),
	spotifyUrl: text("spotify_url"),
	createdAt: timestamp("created_at").defaultNow(),
});
