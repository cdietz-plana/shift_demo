# Shift Coverage Agent: Standard concept, Grand Fortune skin (prototype handoff)

A clickable UX prototype of the Shift Coverage Agent, using the Standard layout dressed for a fictional casino client, The Grand Fortune Casino & Lounge. It's here to show **behavior and layout**, not to be shipped as-is. Everything is mocked in the browser.

## Run it

- Open `index.html` in a browser, or serve the folder from any static host (`npx serve .`, `python3 -m http.server`).
- Password: **PlanA**. This is a demo gate only (checked in the browser, stored in `sessionStorage`). To skip it while developing, run `sessionStorage.setItem('sca-ok','1')` in the console, or remove the `scaGate(...)` wrapper at the bottom of `index.html`.
- Themes: dark is the default. `index.html#light` opens light mode. The sun/moon button switches live.
- Casino skin: the casino photo background and Grand Fortune logo are on by default (the `photo` class on `#app`). Add `?bg=none` to the URL to see the plain, unbranded Standard look.
- No build step, no dependencies, no network calls. Plain HTML, CSS and vanilla JavaScript. Only Google Fonts (Inter, JetBrains Mono) load from outside; it falls back to system fonts offline.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page: layout, styles, views, time navigation, chat dock, demo guide |
| `requests.js` | Demo data: teams, the weekend requests, candidates, policies, decisions, flow wording (`FLOW_CFG`) |
| `shared/flow.js` | The request flow engine (the right-hand panel): draft, approval, eligibility, outreach, responses, "Your call", assign, partial fill, history, worker phone |
| `shared/flow.css` | Flow panel styles (dark by default; `index.html` adds the light skin under `.gen` and dark tweaks under `.gdark`) |
| `shared/face.js` | Shifty, the agent's face: `agentFace()`, `faceTalk()`, `faceHappy()`, cursor-following pupils, random blinks |
| `shared/datamode.js` | "Ops data / Roster only" toggle (`DM.roster`, `DM.full`, `DM.on(fn)`) |
| `shared/gate.js` | Demo password gate |
| `bg-casino.jpg` | Background photo (shown with a tinted overlay so the UI stays readable) |
| `logo-grand-fortune.png` | Client logo, transparent PNG, replaces the generic name top-left in photo mode |

## Layout and navigation

- Fixed 1600×900 canvas scaled to fit the window (`fit()`). **A real build should be responsive**; the fixed canvas is a prototype shortcut.
- **Carousel** of five panels: Overview, Open shifts, Calendar, People, Activity. Nav pills above; side panels are clickable; ← → keys rotate. The centered panel has no 3D transform, so its text stays sharp.
- **Time navigation** in the header: Day / Week / Month with ‹ › and "This week". The level of detail follows the zoom:
  - Day: individual shifts, team × shift grid, every gap actionable.
  - Week: team × day grid, gaps by day.
  - Month (next 5 weeks): heatmap, gaps by week, and "Patterns I see" (suggested fixes) instead of single shifts.
- **Published vs projected:** the schedule is published through Dec 6. Gaps after that are "Projected": no names, can't be sent, drafted once published.
- **Chat dock** (bottom-left): Shifty. Opens a chat panel with suggestion chips; replies carry action buttons. In the prototype this is **keyword matching** (`ask()` in `index.html`), standing in for the real agent.
- **Demo scenarios** (bottom-right): presenter shortcuts to the interesting moments.

## Request lifecycle (what `shared/flow.js` models)

States: `DRAFT → PENDING_APPROVAL → READY_FOR_OUTREACH → OUTREACH_IN_PROGRESS → PARTIALLY_FILLED | FILLED`, plus `UNABLE_TO_FILL`.

Rules the UI enforces:
1. The agent drafts; **nothing is sent until the manager confirms**. The agent never starts outreach on its own.
2. A request with a bonus goes to `PENDING_APPROVAL`. A **second manager** approves it (never the requester). Sending it back needs a reason.
3. **Eligibility** is checked per person with a reason when excluded (certification expired, rest rule, PTO, already scheduled, overtime).
4. Workers reply through a **no-login secure link**. **Accepting is not assignment**; the manager assigns.
5. **Assign early:** Assign enables after the first acceptance. If anyone hasn't replied, a warning lists them; continuing **cancels their offers** and logs each cancellation.
6. **"Your call":** when more people accept than there are spots, the manager picks. The agent shows a comparison (seniority, extra shifts in 30 days, overtime this would add, asked for more hours), applies the policy in `POLICY`, marks a recommendation, and requires a note to override it.
7. **No overfill.** Partial fills offer a next step (for example a bonus round that needs approval, then re-offer) or "Unable to fill".
8. Every step is written to the request's **history** (`r.st.hist`), shown in the drawer and in the Activity table.

Flow API used by the page: `Flow.open(req, opts)`, `Flow.openPlan(reqs, opts)`, `Flow.close()`, `Flow.scen(req)` (demo tags), `Flow.workerView`, `Flow.fullPhone`. `opts.onEvent(type, req, data)` fires on `status`, `sent`, `response`, `assigned`, `close`, `planDone`.

## Data shapes (all in `requests.js` unless noted)

- `TEAMS[key] = {n: name, c: color, hc: headcount}`
- `REQ[id] = {dept, deptName, c, callout, hl, role, loc, when, need, quals, incentive, cands[], next?}`
  - `cands[i] = {name, from, note, ok, resp: 'accept'|'decline'|'none', fit, n, f?}`. `ok:false` means ineligible (the note is the reason); `resp:'none'` never replies.
  - `next` = the follow-up round offered after a partial fill.
  - `st` (created by the flow) = `{status, offers, assigned, released, hist, incentive, ...}`
- `FACT[name] = [seniority yrs, extra shifts 30d, OT hrs added, asked for hours]`
- `POLICY[teamKey] = {rule, pick[], why}`
- `DECISIONS[] = {id, team, t, p, when, opts[[label, detail, recommended]]}`: conflicts that aren't requests
- In `index.html`: `TPL` (staffing template: minimum per team per shift), `G0` (gap list across 5 weeks; weekday and later gaps get generated requests), `PEOPLE` (generated roster), `PUBLISHED_TO`, `HOLI`

## Mocked / prototype-only

- All data is fictional and in memory. **A refresh resets everything.**
- Replies, timing and the worker's phone are simulated.
- The chat is keyword matching, not a language model.
- "Ops data" mode only adds a demand-forecast row and relabels coverage; no real forecasting.
- Password gate is cosmetic.

## Demo scenarios worth knowing

- **Your call:** Security (policy: avoid overtime), Field Service (labor agreement: seniority).
- **Bonus round:** Operations (2 of 4 accept, $50 bonus, second-manager approval, re-offer).
- **No reply:** Ben Shaw (Support), Uma Rao (Operations) trigger the assign-early warning.
- **Worker's phone:** with "Show what the worker sees" on, Security follows Kai (confirmed); Field Service follows Avery (not picked, first in line next time).
- **Decisions:** Alex Kim booked twice; Chris Dunn would reach 46 hours.
- **Month view:** Thanksgiving gaps, recurring Security weekend gaps, projected weeks.
