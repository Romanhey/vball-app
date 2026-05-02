### Folder that contains bugs (only for VBALL.Mobile) should be fixed in format

## KeyboardOverlapAuthScreen
## what actually happans
The schedule screen currently displays outdated filters that are no longer relevant or aligned with current requirements.
## what should do happends
All outdated filters should be removed and replaced with new ones:

Filter by date and time (with the ability to select a range using a calendar)
Filter by participating teams (one or both teams in a match)
## notes (for addition information, for ex way to fix or code refferences)
Update both UI and filtering logic
Ensure date range selection is user-friendly (e.g., calendar picker)
Team filter should support selecting one or multiple teams
Verify backend supports filtering by date range and teams, or implement it if missing