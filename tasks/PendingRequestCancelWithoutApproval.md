## Name
PendingRequestCancelWithoutApproval
## what actually happans
When a player submits a request to join a match and its status is "pending", canceling participation may still require admin approval or follow the same flow as confirmed participation.
## what should do happends
If a player's participation request is in "pending" status, they should be able to cancel it instantly without requiring admin approval. The request should be removed immediately after user action.
notes
Differentiate logic between "pending" and "confirmed" participation states
For "pending" status, cancellation should be a direct action (no admin involvement)
UI should reflect immediate removal of the request
Ensure backend supports direct deletion of pending requests without additional validation constraints