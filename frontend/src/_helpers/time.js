const convertDateStringToSeconds = (dateString) => {
  return new Date(dateString).getTime() / 1000
}

const convertSecondsToDateString = (seconds) => {
  return new Date(seconds * 1000).toISOString().split('T')[0]
}

export { convertDateStringToSeconds, convertSecondsToDateString }
