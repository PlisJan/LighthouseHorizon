export class Position {
  lat: number
  lon: number

  constructor(lat: number, lon: number) {
    this.lat = lat
    this.lon = lon
  }

  /**
   * Generate the direction between this and another position in degrees between 0 and 360
   * @param other G
   */
  public direction360(other: Position): number {
    const dLon = deg2rad(other.lon - this.lon)

    const y = Math.sin(dLon) * Math.cos(deg2rad(other.lat))
    const x =
      Math.cos(deg2rad(this.lat)) * Math.sin(deg2rad(other.lat)) -
      Math.sin(deg2rad(this.lat)) * Math.cos(deg2rad(other.lat)) * Math.cos(dLon)

    let brng = Math.atan2(y, x)

    brng = rad2deg(brng)
    brng = (brng + 360) % 360
    // brng = 360 - brng // count degrees counter-clockwise - remove to make clockwise

    return brng
  }

  /**
   * Generate the direction between this and another position in degrees between -180 and 180
   * @param other G
   */
  public direction(other: Position): number {
    const myDirection = this.direction360(other)
    return myDirection > 180 ? myDirection - 360 : myDirection
  }

  public getDistanceFromLatLonInKm(other: Position): number {
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(other.lat - this.lat) // deg2rad below
    var dLon = deg2rad(other.lon - this.lon)
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(this.lat)) *
        Math.cos(deg2rad(other.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in km
    return d
  }
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

function rad2deg(deg: number): number {
  return deg * (180 / Math.PI)
}
