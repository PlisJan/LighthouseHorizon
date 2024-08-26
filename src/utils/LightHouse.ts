import { Position } from './Position'
//@ts-ignore
import geoPhares from '../../phares.json'

export class Lighthouse {
  name: string
  pos: Position
  maxLightRange: number
  sectors: Sector[] = []

  constructor(name: string, pos: Position, lightRadius: number) {
    this.name = name
    this.pos = pos
    this.maxLightRange = lightRadius
  }

  static fromGeoJson(geoJson: (typeof geoPhares.features)[number]) {
    const name = geoJson.properties.name || geoJson.properties['seamark:name'] || 'Unknown'
    const pos = new Position(
      geoJson.geometry.coordinates.flat(3)[1],
      geoJson.geometry.coordinates.flat(3)[0]
    )
    const maxLightRange = Math.max(
      ...[
        'seamark:light:range',
        'seamark:light:1:range',
        'seamark:light:2:range',
        'seamark:light:3:range',
        'seamark:light:4:range',
        'seamark:light:5:range',
        'seamark:light:6:range',
        'seamark:light:7:range',
        'seamark:light:8:range',
        'seamark:light:9:range'
      ].map((key) => parseFloat(geoJson.properties[key as keyof typeof geoJson.properties] || '0'))
    )
    const myLighthouse = new this(name, pos, maxLightRange)

    if (geoJson.properties['seamark:light:character'] != undefined) {
      myLighthouse.sectors.push({
        min: 0,
        max: 360,
        color: geoJson.properties['seamark:light:colour'] as 'red' | 'white' | 'green' | undefined,
        sequence: generateSequence(geoJson.properties, `seamark:light`)
      })
    }

    // Push sector wise
    let i = 1
    while (
      geoJson.properties[`seamark:light:${i}:character` as keyof typeof geoJson.properties] !=
      undefined
    ) {
      myLighthouse.sectors.push({
        min: parseFloat(
          geoJson.properties[`seamark:light:${i}:sector_end` as keyof typeof geoJson.properties] ||
            '0'
        ),
        max: parseFloat(
          geoJson.properties[
            `seamark:light:${i}:sector_start` as keyof typeof geoJson.properties
          ] || '0'
        ),
        color: geoJson.properties[
          `seamark:light:${i}:colour` as keyof typeof geoJson.properties
        ] as 'red' | 'white' | 'green' | undefined,
        sequence: generateSequence(geoJson.properties, `seamark:light:${i}`)
      })
      i++
    }

    myLighthouse.sectors.forEach((sect) => {
      ;({ darkIntervals: sect.darkIntervals, brightIntervals: sect.brightIntervals } =
        sequence2Animation(sect.sequence || ''))
    })

    return myLighthouse
  }

  public getSectorByViewingPosition(viewingPosition: Position): Sector | undefined {
    const viewingDeg = this.pos.direction360(viewingPosition)
    // console.log(this.name + '    ' + viewingDeg)
    return (
      this.sectors.filter(
        (s) =>
          (s.min < s.max && s.min <= viewingDeg && s.max >= viewingDeg) ||
          (s.min > s.max && (s.min <= viewingDeg || s.max >= viewingDeg))
      )[0] ?? undefined
    )
  }
}

interface Sector {
  min: number //deg
  max: number //deg
  color: 'red' | 'white' | 'green' | undefined
  character?: 'Fl' | 'Oc' | 'Q'
  sequence: string | undefined
  brightIntervals?: number[]
  darkIntervals?: number[]
}

function generateSequence(properties: any, baseKeyString: string) {
  if (
    properties[`${baseKeyString}:sequence`] != undefined &&
    properties[`${baseKeyString}:sequence`].length > 0
  ) {
    return properties[`${baseKeyString}:sequence`]
  }
  if (properties[`${baseKeyString}:character`] == 'Q') {
    return '0.2+(0.6)'
  }
  if (properties[`${baseKeyString}:character`] == 'Fl') {
    const period = properties[`${baseKeyString}:period`]
    return `0.2+(${period - 0.2})`
  }
  if (properties[`${baseKeyString}:character`] == 'Iso') {
    const period = properties[`${baseKeyString}:period`]
    return `${period / 2}+(${period / 2})`
  }
}

export function sequence2Animation(sequence: string): {
  brightIntervals: number[]
  darkIntervals: number[]
} {
  const darkIntervals: number[] = []
  let brightIntervals: number[] = []

  for (const br of sequence.matchAll(/\(([\d.]+)\)/g)) {
    darkIntervals.push(parseFloat(br[1]))
  }
  sequence = sequence
    .replace(/\(([\d.]+)\)/g, '')
    .replace(/,/g, '+') // replace , with +
    .replace('++', '+')
    .replace('++', '+') // remove double plusses

  brightIntervals = sequence
    .split('+')
    .filter((v) => v != '')
    .map((v) => parseFloat(v))

  console.log(darkIntervals)
  console.log(brightIntervals)
  console.log('-----------------------------------------------')
  return {
    brightIntervals,
    darkIntervals
  }
}
