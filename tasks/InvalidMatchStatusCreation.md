### Folder that contains bugs (only for VBALL.Mobile) should be fixed in format

## KeyboardOverlapAuthScreen
## what actually happans
It is currently possible to create a match with the status set to "completed" at the moment of creation.
## what should do happends
TA match should not be allowed to be created with the "completed" status. Only valid initial statuses (e.g., "scheduled" or "pending") should be allowed during creation.
## notes (for addition information, for ex way to fix or code refferences)
Fix should be applied on both client and server side
Server must validate incoming data and reject invalid status values