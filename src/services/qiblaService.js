export function calculateQiblaBearing(lat, lng) {
  const kaabaLat = 21.422487
  const kaabaLng = 39.826206

  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const kaabaLatRad = (kaabaLat * Math.PI) / 180
  const kaabaLngRad = (kaabaLng * Math.PI) / 180

  const deltaLng = kaabaLngRad - lngRad
  const x = Math.sin(deltaLng)
  const y =
    Math.cos(latRad) * Math.tan(kaabaLatRad) -
    Math.sin(latRad) * Math.cos(deltaLng)

  const bearing = (Math.atan2(x, y) * 180) / Math.PI

  return (bearing + 360) % 360
}

export function getCompassDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(((degrees % 360) / 45)) % 8
  return directions[index]
}

export function formatBearingText(degrees) {
  return `${Math.round(degrees)}° ${getCompassDirection(degrees)}`
}

export function getQiblaDisplay(lat, lng, heading = null) {
  const bearing = calculateQiblaBearing(lat, lng)
  const relativeHeading = heading === null ? null : ((bearing - heading + 360) % 360)

  return {
    bearing,
    relativeHeading,
    direction: getCompassDirection(bearing),
    formatted: formatBearingText(bearing),
  }
}
