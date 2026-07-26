@AGENTS.md

# Garden App — Claude Session Notes

## Database Access

**The user accesses this app on their phone via the Vercel production deployment. There is no local database with real data.**

- Local `garden.db` is stale dev data — DO NOT query it
- Production URL: `https://garden-app-sigma.vercel.app`
- The Vercel auth token at `C:\Users\oran.turgeman\AppData\Roaming\xdg.data\com.vercel.cli\auth.json` works as a Bearer token to bypass SSO on the production API

Example:
```bash
TOKEN=$(node -e "console.log(require('C:/Users/oran.turgeman/AppData/Roaming/xdg.data/com.vercel.cli/auth.json').token)")
curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
  "https://garden-app-sigma.vercel.app/api/plants"
```

## Important Rules

- **NEVER run `vercel env pull` on `.env.local`** — it overwrites stored credentials with empty strings for sensitive vars
- Tasks GET filters by current month — pass `?month=YYYY-MM` to query other months, or loop through months
- PATCH `/api/tasks/[id]` to update tasks (not PUT)
- PUT `/api/plants/[id]` to update plants
- POST `/api/tasks` to add tasks (Hebrew input is auto-translated to English)
