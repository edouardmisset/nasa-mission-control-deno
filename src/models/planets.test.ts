// deno-lint-ignore-file camelcase
import { assertEquals, assertNotEquals } from '../test_deps.ts'

Deno.test('Example Test', () => {
  assertEquals('Deno', 'Deno')
  assertNotEquals('Deno', 'Node')
})

Deno.test({
  name: 'Example Test II',
  fn() {
    assertEquals('Deno', 'Deno')
    assertNotEquals('Deno', 'deno')
  },
})

// Testing planet model
import { filterHabitablePlanets } from './planets.ts'

// Creating successful test case
const HABITABLE_PLANET = {
  koi_disposition: 'CONFIRMED',
  koi_prad: '1',
  koi_srad: '1',
  koi_smass: '1',
}

// Creating unsuccessful test cases
const NOT_CONFIRMED = {
  koi_disposition: 'FALSE POSITIVE',
}

const TOO_LARGE_PLANETARY_RADIUS = {
  koi_disposition: 'CONFIRMED',
  koi_prad: '1.5',
}

const TOO_LARGE_SOLAR_RADIUS = {
  koi_disposition: 'CONFIRMED',
  koi_prad: '1',
  koi_srad: '1.01',
}

const TOO_LARGE_SOLAR_MASS = {
  koi_disposition: 'CONFIRMED',
  koi_prad: '1',
  koi_srad: '1',
  koi_smass: '1.04',
}

Deno.test('Filter only habitable planets', () => {
  const fitleredPlanets = filterHabitablePlanets([
    TOO_LARGE_PLANETARY_RADIUS,
    TOO_LARGE_SOLAR_MASS,
    TOO_LARGE_SOLAR_RADIUS,
    HABITABLE_PLANET,
    NOT_CONFIRMED,
  ])
  assertEquals(fitleredPlanets, [HABITABLE_PLANET])
})
