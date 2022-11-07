import { _, BufReader, join, log, parse } from '../deps.ts'

type Planet = Record<string, string>

let planets: Planet[]

export function filterHabitablePlanets(planets: Planet[]) {
  return planets.filter(planet => {
    const planetaryRadius = Number(planet['koi_prad'])
    const stellarMass = Number(planet['koi_smass'])
    const stellarRadius = Number(planet['koi_srad'])
    return (
      planet['koi_disposition'] === 'CONFIRMED' &&
      0.5 < planetaryRadius &&
      planetaryRadius < 1.5 &&
      0.78 < stellarMass &&
      stellarMass < 1.04 &&
      0.99 < stellarRadius &&
      stellarRadius < 1.01
    )
  })
}

async function loadPlanetsData() {
  const path = join('data', 'kepler_exoplanets_nasa.csv')
  const file = await Deno.open(path)
  const bufReader = new BufReader(file)
  const result = await parse(bufReader, {
    skipFirstRow: true,
    comment: '#',
  })
  Deno.close(file.rid)

  const planets = filterHabitablePlanets(result as Planet[])
  return planets.map(planet =>
    _.pick(
      planet,
      'koi_disposition',
      'koi_srad',
      'koi_smass',
      'koi_prad',
      'kepler_name',
      'koi_count',
      'koi_steff',
      'koi_period',
    ),
  )
}

planets = await loadPlanetsData()

if (import.meta.main) {
  log.info(`${planets.length} habitable planets founds!`)
}

export function getAllPlanets() {
  return planets
}
