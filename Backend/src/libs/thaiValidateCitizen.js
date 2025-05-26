const validateThaiCitizenId = thaiId => {
  if (typeof thaiId !== 'string') thaiId += ''
  const m = thaiId.match(/(\d{12})(\d)/)
  if (!m) {
    console.warn('Bad input from user, invalid thaiId=', thaiId)
    return false
  }
  const digits = m[1].split('')
  const sum = digits.reduce((total, digit, i) => {
    return total + (13 - i) * +digit
  }, 0)
  const lastDigit = `${(11 - (sum % 11)) % 10}`
  const inputLastDigit = m[2]
  if (lastDigit !== inputLastDigit) {
    console.warn('Bad input from user, invalid checksum thaiId=', thaiId)
    return false
  }
  return true
}

module.exports = { validateThaiCitizenId }
