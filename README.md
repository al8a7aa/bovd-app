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

## Built on NASA resources

Every part of the app is tied to a NASA source. The app has a screen, **NASA basis**, that shows the link
for each feature and says plainly what the app does not cover.

**From the challenge's Resources tab**

- NASA Human Research Program — [5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/).
  The app is organised around these five hazards. Each body system and reading names the hazard behind it.
- NASA Human Research Program — [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/).
  All 17 NASA risks are listed in the app: 6 are monitored, 6 partly, and 5 are not covered (and it says why).
- NASA Human Research Program — [Ongoing HRP Research in Space](https://www.nasa.gov/hrp/ongoing-hrp-research/).
  Features follow studies such as Standard Measures, ARCHeR and Tempus Pro.
- Canadian Space Agency — [Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp).

**NASA's astronaut health archives**

- [NASA Standard Measures](https://nlsp.nasa.gov/resources/standard-measures) (Life Sciences Data Archive, LSDA).
  The daily check is compared, measure by measure, with the nine Standard Measures NASA collects on the space station.
- [Lifetime Surveillance of Astronaut Health](https://nlsp.nasa.gov/resources/lsah) (LSAH).
  The body map follows the body systems LSAH keeps under surveillance.

**NASA's own numbers used as targets and limits**

| Number | What it is | NASA source |
|---|---|---|
| 7–9 hours | Sleep an adult needs; astronauts average about 6 in space | OCHMO-TB-041, Sleep Accommodations |
| 2.5 litres | Minimum drinking water per crew member per day | NASA-STD-3001 Vol. 2, Table 6.3-1 [V2 6109] |
| 1.5 hours | Daily exercise on the space station | HRP — Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness |
| 1–1.5% | Bone density lost each month | HRP — Risk of Spaceflight-Induced Bone Changes |
| 600 mSv | Career radiation dose limit | NASA-STD-3001 Vol. 1 [V1 4030] |
| 3 mmHg | Cabin carbon dioxide limit, one-hour average | NASA-STD-3001 Vol. 2 [V2 6004] |
| 20 minutes | Longest one-way delay to Mars | HRP — Distance from Earth hazard |
| 70% | Station astronauts with some swelling at the back of the eye | HRP — Risk of SANS |

**Live NASA data**

- NASA DONKI solar flare reports, with NOAA SWPC GOES X-ray flare data as a backup when DONKI does not answer.

**Where the app does not use NASA**

NASA's public pages give no number limits for heart rate, blood pressure, blood oxygen, temperature or blood
sugar. For those five readings the app uses published medical ranges and names them on screen:
NEWS2 (Royal College of Physicians, 2017), the ACC/AHA blood pressure guideline (2017), and the ADA Standards of
Care in Diabetes. Radiation dose rates come from Zeitlin et al. 2013, Hassler et al. 2014 and Zhang et al. 2020.
Orbital elements for the Earth–Mars distance are JPL's approximate planetary positions.

## Honest notes

- **The crew data is simulated.** NASA keeps each astronaut's health record private; its LSAH programme says
  records may show "normal" rather than specific values. The app labels the demo crew as simulated on every screen.
- **This is a prototype, not a medical device.** It does not diagnose.
- **Health advice comes from fixed rules** with cited sources, not from the AI. The AI helper only explains.
- **All data stays on the device.** The only exception is the optional online helper, which says so on screen.
- Before the event the team tried the idea out in a separate throwaway prototype. This repository was started
  and written during the hackathon.

## Use of AI

- **Code:** written with an AI coding assistant (Claude Code by Anthropic), under the team's direction.
  Every commit carries a `Co-Authored-By` line for it.
- **Arabic text:** drafted by the same assistant. The team are native Arabic speakers.
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
