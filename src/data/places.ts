export type PlaceId = 'station' | 'moon' | 'transit' | 'rover'

/** Where the crew is. It decides how fast help can come, and so what the advice says. */
export interface Place {
  id: PlaceId
  name: string
  gravity: string
  returnTime: string
  /** which signal path to Earth applies */
  link: 'leo' | 'moon' | 'mars'
  /** typical radiation dose in mSv per day */
  doseRate: number
  doseSource: string
  note: string
  /** who to tell about a red finding */
  red: string
  /** who to tell about an amber finding */
  amber: string
}

// "40 minutes": NASA gives the Mars delay as up to 20 minutes one way, so a question and its answer take up to 40.
export const PLACES: Place[] = [
  {
    id: 'station',
    name: 'Space station',
    gravity: '0 g',
    returnTime: 'Hours',
    link: 'leo',
    doseRate: 0.6,
    doseSource: 'ISS average, NASA space radiation analysis',
    note: 'Low Earth orbit. Flight surgeons can talk to you in real time and you can return within hours.',
    red: 'Tell the crew medical officer and call the flight surgeon now. The link is live.',
    amber: 'Re-measure later today. If it is still out of range, raise it at your next private medical conference.',
  },
  {
    id: 'moon',
    name: 'Lunar base',
    gravity: '0.16 g',
    returnTime: 'Days',
    link: 'moon',
    doseRate: 1.37,
    doseSource: 'Chang’E-4 lander measurement, Zhang et al. (2020)',
    note: 'Partial gravity helps a little, but dust and radiation exposure are higher and return takes days.',
    red: 'Tell the crew medical officer and call the flight surgeon now. Start the onboard procedure while you wait — return takes days.',
    amber: 'Re-measure later today. If it is still out of range, include it in today’s report to the flight surgeon.',
  },
  {
    id: 'transit',
    name: 'Mars transit ship',
    gravity: '0 g',
    returnTime: 'Not possible',
    link: 'mars',
    doseRate: 1.84,
    doseSource: 'MSL RAD cruise measurement, Zeitlin et al. (2013)',
    note: 'Deep space. Radiation is highest here, there is no return, and a question to Earth can take 40 minutes to answer.',
    red: 'Tell the crew medical officer now and start the onboard procedure. Send a report to Earth, but do not wait for the reply — it can take 40 minutes.',
    amber: 'Re-measure later today and log it. If it is still out of range, add it to the next data package to Earth.',
  },
  {
    id: 'rover',
    name: 'Mars surface rover',
    gravity: '0.38 g',
    returnTime: 'Hours to base, months to Earth',
    link: 'mars',
    doseRate: 0.67,
    doseSource: 'MSL RAD surface measurement, Hassler et al. (2014)',
    note: 'Away from base in a small pressurised cabin. Your crewmate in the rover is your only immediate help.',
    red: 'Tell your rover crewmate now, start the onboard procedure and plan the drive back to base. Report to base; Earth’s reply can take 40 minutes.',
    amber: 'Re-measure later today and log it. Tell base at the next check-in.',
  },
]

export const PLACE = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<PlaceId, Place>

/** NASA Human Research Program: the five hazards of human spaceflight. */
export const HAZARDS = [
  {
    name: 'Space radiation',
    effect: 'Raises lifetime cancer risk and can harm the nervous system, thinking and immune cells.',
    watch: 'Temperature, skin changes, tiredness.',
  },
  {
    name: 'Isolation and confinement',
    effect: 'Disturbs sleep, lowers mood and strains teamwork.',
    watch: 'Sleep hours, mood.',
  },
  {
    name: 'Distance from Earth',
    effect: 'Slow or no contact with doctors, no resupply and no quick return. You make the first call yourself.',
    watch: 'Every indicator — early action matters more the farther you are.',
  },
  {
    name: 'Gravity fields',
    effect: 'Bones and muscles weaken, fluid shifts to the head, the heart deconditions and vision can change.',
    watch: 'Exercise minutes, heart rate, blood pressure, vision.',
  },
  {
    name: 'Hostile closed environments',
    effect: 'Shared air, water and surfaces spread germs; cabin air faults affect breathing; food is limited.',
    watch: 'Blood oxygen, temperature, water intake, blood sugar.',
  },
]

export interface CrewMember {
  id: string
  name: string
  /** demo-data settings: each simulated person has their own normal */
  seed: number
  hr: number
  sleep: number
}

export const CREW: CrewMember[] = [
  { id: 'cdr', name: 'Commander', seed: 2026, hr: 62, sleep: 7.4 },
  { id: 'plt', name: 'Pilot', seed: 7, hr: 58, sleep: 7.2 },
  { id: 'ms', name: 'Mission specialist', seed: 42, hr: 68, sleep: 7.6 },
  { id: 'cmo', name: 'Medical officer', seed: 99, hr: 64, sleep: 7.0 },
]

export interface Task {
  id: string
  /** local time, 24-hour "HH:MM" */
  time: string
  label: string
  detail: string
  /** done automatically when today's health check, or today's reaction test, is saved */
  auto?: 'checkin' | 'reaction'
}

/** One mission day: work, exercise, then a protected sleep period. */
export const SCHEDULE: Task[] = [
  { id: 'check', time: '07:00', label: 'Morning health check', detail: 'Before breakfast, so blood sugar is a fasting reading.', auto: 'checkin' },
  { id: 'react', time: '07:15', label: 'Reaction self-test', detail: 'One minute. Shows if tiredness is slowing you.', auto: 'reaction' },
  { id: 'water1', time: '09:30', label: 'Drink 500 ml of water', detail: 'Thirst is weak in space. Drink by the clock.' },
  { id: 'cardio', time: '10:30', label: 'Cardio session', detail: 'Treadmill or cycle, 45 minutes.' },
  { id: 'water2', time: '13:30', label: 'Drink 500 ml of water', detail: 'With your midday meal.' },
  { id: 'resist', time: '16:00', label: 'Resistance session', detail: 'Squats, deadlifts and heel raises, 60 minutes.' },
  { id: 'home', time: '19:30', label: 'Free time and message home', detail: 'Contact with family protects your mood.' },
  { id: 'wind', time: '21:30', label: 'Wind down', detail: 'Dim the lights. No screens or work.' },
  { id: 'sleep', time: '22:30', label: 'Sleep period starts', detail: 'Aim for 8 hours.' },
]

export function clockNow(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
