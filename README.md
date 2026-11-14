# BÖVD — crew health

A health self-check app for astronauts on long space missions.
Built by team BÖVD during the **NASA Space Apps Challenge 2026** (14–15 November 2026) for the challenge
*Create Health Monitoring Software for Astronauts on Space Missions*.

On a Mars mission a question to a doctor on Earth can take up to 40 minutes to answer.
BÖVD helps an astronaut **check** their own health, **understand** it, and **act** — with no link to Earth.

## What it does

- **Guided daily check.** Ten indicators (heart rate, blood pressure, blood oxygen, temperature, blood sugar,
  sleep, mood, water, exercise) with step-by-step measuring instructions and the reason each one matters in space.
- **Clear status.** Every reading is green, amber or red, judged against a reference range *and* the astronaut's
  own first-week baseline.
- **What to do.** Each finding has action steps to tick off, a timer for "measure again", and who to tell.
  The advice changes with the place: space station, lunar base, Mars transit ship or Mars rover.
- **Body map.** Six body systems, each with the spaceflight hazard that affects it and how to protect it.
- **Trends.** Charts with the normal range shaded and the personal baseline marked.
- **Daily plan.** A timed schedule with reminders, a streak, levels and badges.
- **Report for the flight surgeon.** A text summary to copy or print.
- **Mind.** A breathing exercise and a private journal.
- **AI helper.** Explains the report in simple words. It can run fully on the device (no internet), or online.
- **English and Arabic**, with a right-to-left layout.
- **Works offline** after the first visit, and can be installed like an app.

## NASA and partner resources used

From the challenge's Resources tab:

- NASA Human Research Program — [5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/):
  the app is organised around these hazards, and uses its facts (for example 1–1.5% bone mineral density loss
  per month, kidney stone risk from dehydration, the Mars communication delay).
- NASA Human Research Program — [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/):
  the body systems, symptoms and alerts map to these risks.
- Canadian Space Agency — [Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp).

Other open data and references:

- NASA DONKI solar flare reports (live), with NOAA SWPC GOES X-ray flare data as a backup.
- NASA-STD-3001 (600 mSv career radiation limit).
- Radiation dose rates: Zeitlin et al. 2013 (Mars transit), Hassler et al. 2014 (Mars surface), Zhang et al. 2020 (Moon).
- Health reference ranges: NEWS2 (Royal College of Physicians, 2017), ACC/AHA blood pressure guideline (2017),
  ADA Standards of Care in Diabetes, Barger et al. 2014 (sleep in space), Stahn et al. 2017 (body temperature in space).
- Orbital elements for the Earth–Mars distance: JPL approximate planetary positions.

## Honest notes

- **The crew data is simulated.** Real astronaut vital signs are not public. The app labels the demo crew as
  simulated on every screen.
- **This is a prototype, not a medical device.** It does not diagnose.
- **Health advice comes from fixed rules** with cited sources, not from the AI. The AI helper only explains.
- **All data stays on the device.** The only exception is the optional online helper, which says so on screen.
- Before the event the team tried the idea out in a separate throwaway prototype. This repository was started
  and written during the hackathon.

## Use of AI

- **Code:** written with an AI coding assistant (Claude Code by Anthropic), directed, reviewed and tested by the
  team. Every commit carries a `Co-Authored-By` line for it.
- **Arabic text:** drafted by the same assistant and checked by the team, who are native speakers.
- **Inside the app:** the optional helper uses an open model run in the browser with WebLLM (Qwen2.5), or the
  Claude API when the user pastes their own key. No key is stored in this repository.
- No AI-generated images, audio or video are used. No NASA logos or mission emblems are used.

## Run it

```bash
npm install
npm run dev      # start the app
npm test         # run the rule, physics and translation tests
npm run build    # build for hosting; output is in dist/
```

Built with React, TypeScript, Vite, Tailwind CSS, Recharts and Zustand.

## Team

Team BÖVD — Ibn Al Atheer School, Shinas, Oman. The name comes from the Boötes Void.

## Licence

MIT — see [LICENSE](LICENSE).
