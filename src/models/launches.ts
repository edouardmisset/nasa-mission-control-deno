import { _, log } from '../deps.ts'

const SPACE_X_API_URL = 'https://api.spacexdata.com/v3/launches'

interface Launch {
  flightNumber: number
  mission: string
  rocket: string
  customers: string[]
  launchDate: number
  upcoming: boolean
  success?: boolean
  target?: string
}

const launches = new Map<number, Launch>()

async function downloadLaunchData() {
  log.info('Downloading launch data...')
  // log.warning('WARNING')
  const response = await fetch(SPACE_X_API_URL, { method: 'GET' })
  if (!response.ok) {
    log.warning('Problem downloading launch data')
    throw new Error('Launch data download failed')
  }
  const launchData = await response.json()

  for (const launch of launchData) {
    const payloads = launch['rocket']['second_stage']['payloads']
    const customers = _.flatMap(
      payloads,
      // deno-lint-ignore no-explicit-any
      (payload: any) => payload['customers'],
    )

    const flightData = {
      flightNumber: launch['flight_number'],
      mission: launch['mission_name'],
      rocket: launch['rocket']['rocket_name'],
      customers,
      launchDate: launch['launch_date_unix'],
      upcoming: launch['upcoming'],
      success: launch['launch_success'],
    }
    launches.set(flightData.flightNumber, flightData)
    // log.info(JSON.stringify(flightData))
  }
}

await downloadLaunchData()
log.info(`Retrieved ${launches.size} launches from Space X`)

export function getAll() {
  return Array.from(launches.values())
}

export function getOne(id: number) {
  if (launches.has(id)) {
    return launches.get(id)
  }
  return null
}

export function addOne(data: Launch) {
  launches.set(
    data.flightNumber,
    Object.assign(data, {
      upcoming: true,
      customers: ['NASA', 'Zero To Mastery'],
    }),
  )
}

export function removeOne(id: number) {
  const aborted = launches.get(id)
  if (aborted) {
    aborted.upcoming = false
    aborted.success = false
  }
  return aborted
}
