## what actually happans
Currently, users can view their upcoming matches in the profile screen, but there is no option to cancel participation in a match.
## what should do happends
Users should be able to cancel their participation directly from the match card in the "upcoming matches" section.
Each match card should include a visible "Cancel participation" action (button or icon)
On click, a confirmation dialog should appear
After confirmation, the participation should be canceled and the UI should update accordingly
## notes
Action should be available only for valid cases (e.g., not for completed matches)
Consider restricting cancellation close to match start time (if such rules exist)
Ensure proper error handling from server responses
UI should update without full screen reload
Button/icon should not break existing layout (adapt card design if needed)