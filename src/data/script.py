import pandas as pd
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import time
from datetime import datetime
from urllib.parse import quote

# Initialize Spotify client
client_id = "59509d801e46478daf137ee037683ef9"
client_secret = "be6dd8744362433bbb66f2058706dc9f"

client_credentials_manager = SpotifyClientCredentials(
    client_id=client_id, client_secret=client_secret
)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)


def is_likely_original(album_name, album_type):
    # Keywords that suggest non-original releases
    rerelease_keywords = [
        "remaster",
        "live",
        "compilation",
        "deluxe",
        "edition",
        "greatest hits",
        "best of",
        "collection",
        "anthology",
        "live at",
        "recorded live",
        "concert",
        "sessions",
        "re-release",
        "anniversary",
        "expanded",
        "bonus",
        "soundtrack",
        "karaoke",
        "tribute",
        "covers",
    ]

    # Check if it's a single, EP, or album (not compilation)
    if album_type not in ["album", "single", "ep"] or album_type == "compilation":
        return False

    # Check for rerelease keywords in album name (case insensitive)
    album_name_lower = album_name.lower()
    if any(keyword in album_name_lower for keyword in rerelease_keywords):
        return False

    return True


def get_original_release_date(track_name, artist_name):
    try:
        # Search for all versions of the track
        query = quote(f"track:{track_name},artist:{artist_name}")
        results = sp.search(q=query, type="track", limit=50)

        if not results["tracks"]["items"]:
            return None, None

        # Filter and sort releases
        valid_releases = []

        for track in results["tracks"]["items"]:
            # Verify the artist name matches (case-insensitive)
            track_artists = [artist["name"].lower() for artist in track["artists"]]
            if artist_name.lower() not in track_artists:
                continue

            album = track["album"]

            # Check if this is likely an original release
            if is_likely_original(album["name"], album["album_type"]):
                try:
                    # Convert release_date to datetime for comparison
                    # Handle partial dates (YYYY or YYYY-MM)
                    release_date = album["release_date"]
                    if len(release_date) == 4:  # YYYY format
                        release_date += "-01-01"
                    elif len(release_date) == 7:  # YYYY-MM format
                        release_date += "-01"

                    release_datetime = datetime.strptime(release_date, "%Y-%m-%d")

                    valid_releases.append(
                        {
                            "date": release_datetime,
                            "date_string": album["release_date"],
                            "album_name": album["name"],
                        }
                    )
                except ValueError:
                    continue

        if not valid_releases:
            return None, None

        # Sort by date and get the earliest release
        valid_releases.sort(key=lambda x: x["date"])
        earliest_release = valid_releases[0]

        return earliest_release["date"].year, earliest_release["album_name"]

    except Exception as e:
        print(f"Error processing {track_name} by {artist_name}: {str(e)}")
        return None, None


# Read the CSV file
df = pd.read_csv("src/data/most_popular_merged.csv")  # Replace with your file name

# Add release dates and album names
release_dates = []
album_names = []

for index, row in df.iterrows():
    track_name = row["Song"]  # Replace with your column name
    artist_name = row["Artist"]  # Replace with your column name

    print(f"Processing ({index + 1}/{len(df)}): {track_name} by {artist_name}")

    release_date, album_name = get_original_release_date(track_name, artist_name)
    print(f"Release date: {release_date}, Album name: {album_name}")
    release_dates.append(release_date)
    album_names.append(album_name)

    # Add a small delay to avoid hitting API rate limits
    time.sleep(0.1)

# Add the new columns to the dataframe
df["release_date"] = release_dates
df["original_album"] = album_names

# Save the modified CSV
df.to_csv("songs_with_dates.csv", index=False)
