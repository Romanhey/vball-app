### Folder that contains bugs (only for VBALL.Mobile) should be fixed in format

## KeyboardOverlapAuthScreen
## what actually happans
On the match registration button, the number indicating selected matches does not fit properly inside the red circular badge. The text overflows or breaks the layout.
## what should do happends
The counter value should always fit inside the red circular badge and remain properly centered and readable regardless of the number of selected matches.
## notes (for addition information, for ex way to fix or code refferences)
Update both UI and filtering logic
Ensure date range selection is user-friendly (e.g., calendar picker)
Team filter should support selecting one or multiple teams
Verify backend supports filtering by date range and teams, or implement it if missing