/**
 * How the app ties to NASA's own material. Official NASA names (risks, measures, systems, studies)
 * are kept in English as proper names; the `how` and `what` texts are ours and are translated.
 *
 * Read on 14 November 2026 from the pages in SOURCES.
 */

export type Coverage = 'yes' | 'partly' | 'no'

export interface Link {
  name: string
  coverage: Coverage
  /** what the app does about it, or why it does not */
  how: string
}

export interface NasaRisk extends Link {
  group: 'Human physiology' | 'Behavioral performance and human factors' | 'Space radiation'
}

/** The 17 risks on NASA's "Risks of Human Spaceflight" page, in NASA's order and grouping. */
export const RISKS: NasaRisk[] = [
  { group: 'Human physiology', name: 'Risk of Altered Immune System Responses', coverage: 'yes', how: 'Daily temperature, immune symptoms such as rash and cold sore, and a possible-infection alert.' },
  { group: 'Human physiology', name: 'Risk of Altered Sensorimotor and Vestibular Function', coverage: 'partly', how: 'Dizziness and nausea can be logged as symptoms. Balance is not tested.' },
  { group: 'Human physiology', name: 'Risk of Cardiovascular Adaptations', coverage: 'yes', how: 'Daily resting heart rate and blood pressure, each compared with your own baseline.' },
  { group: 'Human physiology', name: 'Risk of Decompression Sickness', coverage: 'no', how: 'A spacewalk risk. The app does not cover spacewalks.' },
  { group: 'Human physiology', name: 'Risk of Host-Microorganism Interactions', coverage: 'no', how: 'Needs laboratory samples, which the app cannot take.' },
  { group: 'Human physiology', name: 'Risk of Hypoxia', coverage: 'partly', how: 'Daily blood oxygen reading, with a prompt to check the cabin air.' },
  { group: 'Human physiology', name: 'Risk of Inadequate Food and Nutrition', coverage: 'partly', how: 'Daily water against NASA’s 2.5 litre minimum, and fasting blood sugar. Food intake is not logged.' },
  { group: 'Human physiology', name: 'Risk of Injury and Compromised Performance from Spacewalks', coverage: 'no', how: 'The app does not cover spacewalks.' },
  { group: 'Human physiology', name: 'Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness', coverage: 'yes', how: 'Daily exercise minutes against NASA’s 1.5 hours, with an alert after a week below target.' },
  { group: 'Human physiology', name: 'Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)', coverage: 'partly', how: 'Blurred vision raises an alert and a weekly near-vision test is advised. The eye itself is not imaged.' },
  { group: 'Human physiology', name: 'Risk of Spaceflight-Induced Bone Changes', coverage: 'partly', how: 'Tracks the countermeasure, daily resistance exercise. Bone density itself needs a scan.' },
  { group: 'Behavioral performance and human factors', name: 'Risk of Behavioral Changes and Psychiatric Disorders', coverage: 'yes', how: 'Daily mood, a low-mood alert, a private journal and a breathing exercise.' },
  { group: 'Behavioral performance and human factors', name: 'Risk of Inadequate Teamwork', coverage: 'no', how: 'The app looks at one person at a time, not at the team.' },
  { group: 'Behavioral performance and human factors', name: 'Risk of Inadequate Sleep and Irregular Schedules', coverage: 'yes', how: 'Sleep hours against NASA’s 7–9 hours, a sleep-debt alert, and a fixed daily plan.' },
  { group: 'Behavioral performance and human factors', name: 'Risk of Inadequate Systems Operations Support', coverage: 'partly', how: 'Gives step-by-step guidance when the ground cannot answer in time. It covers health only, not vehicle systems.' },
  { group: 'Behavioral performance and human factors', name: 'Risk of Injury from Dynamic Loads', coverage: 'no', how: 'A landing risk. The app does not cover landing.' },
  { group: 'Space radiation', name: 'Risk of Radiation-Induced Cancers', coverage: 'yes', how: 'Mission dose estimate against NASA’s 600 mSv career limit, and live solar flare reports.' },
]

/** NASA Standard Measures collected on the International Space Station (NASA Life Sciences Portal). */
export const STANDARD_MEASURES: (Link & { discipline: string })[] = [
  { name: 'Actigraphy', discipline: 'Behavioral Health', coverage: 'partly', how: 'Sleep hours are entered by hand, or copied from a wrist tracker.' },
  { name: 'Sleep Quality / Team Questionnaire', discipline: 'Behavioral Health', coverage: 'partly', how: 'Sleep hours and mood are asked every day. There are no team questions.' },
  { name: 'Cognition', discipline: 'Behavioral Health', coverage: 'no', how: 'Not yet. A reaction-time self-test is the planned next step.' },
  { name: 'Personality Questionnaire', discipline: 'Behavioral Health', coverage: 'no', how: 'Not part of a daily health check.' },
  { name: 'Biochemical Measures', discipline: 'Biochemistry', coverage: 'partly', how: 'Fasting blood sugar only. Other blood tests need a laboratory.' },
  { name: 'Carotid Intima-Media Thickness', discipline: 'Cardiovascular Physiology', coverage: 'no', how: 'Needs ultrasound. The app tracks heart rate and blood pressure instead.' },
  { name: 'Cellular Profile', discipline: 'Immunology', coverage: 'no', how: 'Needs blood samples. The app tracks temperature and symptoms instead.' },
  { name: 'Microbiome', discipline: 'Microbiome', coverage: 'no', how: 'Needs laboratory samples.' },
  { name: 'Sensorimotor', discipline: 'Sensorimotor Physiology', coverage: 'no', how: 'Dizziness can be logged, but balance is not tested.' },
]

/** The ten body systems under surveillance in NASA's Lifetime Surveillance of Astronaut Health. */
export const LSAH_SYSTEMS: Link[] = [
  { name: 'Behavior Health & Performance', coverage: 'yes', how: 'Body map: brain and behaviour. Mood, sleep, journal.' },
  { name: 'Bone, Muscle & Exercise', coverage: 'yes', how: 'Body map: bones and muscles. Daily exercise minutes.' },
  { name: 'Cardiovascular', coverage: 'yes', how: 'Body map: heart and circulation. Heart rate and blood pressure.' },
  { name: 'Environmental Health', coverage: 'partly', how: 'Blood oxygen, with a prompt to check cabin air and temperature.' },
  { name: 'Extravehicular Activity (EVA)', coverage: 'no', how: 'The app does not cover spacewalks.' },
  { name: 'Immunology', coverage: 'yes', how: 'Body map: immune system. Temperature and symptoms.' },
  { name: 'Neurology', coverage: 'partly', how: 'Body map: eyes and vision. Vision and dizziness symptoms.' },
  { name: 'Nutrition', coverage: 'yes', how: 'Body map: nutrition. Water and fasting blood sugar.' },
  { name: 'Radiation', coverage: 'yes', how: 'Mission dose estimate and space weather on the Today screen.' },
  { name: 'Therapeutics & Clinical Care', coverage: 'partly', how: 'Action steps for each finding and a report for the flight surgeon. No medicines are advised.' },
]

/** Studies on NASA's "Ongoing HRP Research in Space" page that the app's features follow. */
export const RESEARCH: { name: string; what: string; ours: string }[] = [
  { name: 'Standard Measures', what: 'A consistent set of physical and psychological measurements from every crew member.', ours: 'The same idea as our daily check: the same readings, every day, for everyone.' },
  { name: 'ARCHeR (Artemis II)', what: 'Wrist-worn devices tracked the crew’s well-being, activity and sleep in deep space.', ours: 'Our sleep and exercise readings accept totals from a wrist tracker.' },
  { name: 'Immune Biomarkers (Artemis II)', what: 'Blood and saliva samples show how deep space changes the immune system.', ours: 'We watch the signs an astronaut can see: temperature, rash, cold sore, sore throat.' },
  { name: 'Thigh Cuff and B-Complex', what: 'Two ways NASA is testing to prevent eye and brain changes in space.', ours: 'Our eyes section explains the fluid shift and asks for a weekly vision test.' },
  { name: 'Zero T2', what: 'How exercising without a treadmill affects health before deep space missions.', ours: 'Our plan splits exercise into cardio and resistance sessions.' },
  { name: 'Tempus Pro', what: 'A device that collects health data so doctors can diagnose from far away.', ours: 'Our report gathers the readings into one message for the flight surgeon.' },
]

/** NASA's own numbers that set a target or a limit in the app. */
export const NUMBERS: { value: string; what: string; source: string }[] = [
  { value: '7–9 h', what: 'Sleep an adult needs. Astronauts average about 6 hours in space.', source: 'NASA OCHMO-TB-041, Sleep Accommodations' },
  { value: '2.5 L', what: 'Minimum drinking water per crew member per day.', source: 'NASA-STD-3001 Vol. 2, Table 6.3-1 [V2 6109]' },
  { value: '1.5 h', what: 'Daily exercise on the space station, six to seven days a week.', source: 'NASA HRP — Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness' },
  { value: '1–1.5%', what: 'Bone density lost each month in the spine and hips.', source: 'NASA HRP — Risk of Spaceflight-Induced Bone Changes' },
  { value: '600 mSv', what: 'Career radiation dose limit for every astronaut.', source: 'NASA-STD-3001 Vol. 1 [V1 4030]' },
  { value: '3 mmHg', what: 'Highest average cabin carbon dioxide over one hour.', source: 'NASA-STD-3001 Vol. 2 [V2 6004]' },
  { value: '20 min', what: 'Longest one-way communication delay to Mars.', source: 'NASA HRP — Distance from Earth hazard' },
  { value: '70%', what: 'Share of space station astronauts with some swelling at the back of the eye.', source: 'NASA HRP — Risk of SANS' },
]

export const SOURCES: { name: string; url: string }[] = [
  { name: 'NASA HRP — 5 Hazards of Human Spaceflight', url: 'https://www.nasa.gov/hrp/hazards/' },
  { name: 'NASA HRP — Risks of Human Spaceflight', url: 'https://www.nasa.gov/hrp/risks/' },
  { name: 'NASA HRP — Ongoing HRP Research in Space', url: 'https://www.nasa.gov/hrp/ongoing-hrp-research/' },
  { name: 'NASA Life Sciences Portal — Standard Measures (LSDA)', url: 'https://nlsp.nasa.gov/resources/standard-measures' },
  { name: 'NASA Life Sciences Portal — Lifetime Surveillance of Astronaut Health (LSAH)', url: 'https://nlsp.nasa.gov/resources/lsah' },
  { name: 'NASA-STD-3001 Vol. 1 Rev. C — Crew Health', url: 'https://standards.nasa.gov/sites/default/files/standards/NASA/C/nasa-std-3001-vol-1-rev-c-signature.pdf' },
  { name: 'NASA-STD-3001 Vol. 2 Rev. D — Human Factors, Habitability and Environmental Health', url: 'https://standards.nasa.gov/sites/default/files/standards/NASA/D/nasa-std-3001-vol-2-rev-d-signature.pdf' },
  { name: 'NASA OCHMO-TB-041 — Sleep Accommodations', url: 'https://www.nasa.gov/wp-content/uploads/2023/03/sleep-accomodations-technical-brief-ochmo.pdf' },
  { name: 'NASA DONKI — Space Weather Database', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' },
  { name: 'Canadian Space Agency — Monitoring Radiation for Astronaut Health', url: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp' },
]

export const coverageCount = (items: Link[]) => ({
  yes: items.filter((i) => i.coverage === 'yes').length,
  partly: items.filter((i) => i.coverage === 'partly').length,
  no: items.filter((i) => i.coverage === 'no').length,
})
