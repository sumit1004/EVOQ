# UI/UX Specification
## Experience
Premium, modern, dark-first esports operations UI. Optimize organizer speed and clarity. Avoid excessive gradients, glow and glassmorphism. Critical status must use text labels, not color alone.

## Navigation
Public: EVOQ, Tournaments, Login/Join. Gamer: Overview, Profile, Teams, Tournament history, Achievements, Notifications. Organizer: Overview, Tournaments, Registrations, Competition, Results, Announcements, Profile/Organization. Admin: Moderation, Users, Audit. Navigation is capability-aware but is not a security boundary.

## Page inventory
| Page | Main data/components | Actions | Required states |
|---|---|---|---|
| Landing | Hero, value pillars, featured tournaments | Browse | Loading/error |
| Login/Register | Form, validation | Authenticate | Field errors/throttle |
| Gamer dashboard | Profile completeness, stats, activity | Edit profile | Empty |
| Gamer public profile | Identity, games, achievements, history | Share | Private/not found |
| Team pages | Identity, roster | Invite/manage | Empty roster |
| Tournament discovery | Search/filter cards | Open details | No results |
| Tournament detail | Rules, schedule, capacity, organizer | Register | Closed/full |
| Registration | Entrant and roster snapshot | Submit/withdraw | Conflict |
| Organizer dashboard | KPIs, pending queues | Manage | First-event empty |
| Tournament management | Settings, lifecycle, staff | Edit/publish | Locked fields |
| Round/group management | Stage/group builder | Create/allocate | Invalid progression |
| Match management | Match list/calendar | Schedule/update | No matches |
| Result management | Result form, revisions, evidence | Submit/approve/correct | Pending/conflict |
| Leaderboard | Standings table | Filter round/group | No approved results |
| Organizer profile | Identity and portfolio | View | Unverified label |
| Admin dashboard | Moderation/audit | Suspend/hide/review | Empty/error |

## Interaction requirements
Every view defines loading, empty, error, forbidden and success states. Result approval/correction previews downstream impact. Destructive actions require confirmation and reason. Protected credentials are not preloaded in HTML. Tables become cards or scrollable layouts on mobile. Forms have visible labels and inline server validation. Use keyboard-accessible dialogs and navigation.
