const applicationClaimsKey = 'pawloka:application-history'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const tokenPattern = /^[0-9a-f]{64}$/

export function readApplicationClaims() {
  try {
    const storedClaims = window.localStorage.getItem(applicationClaimsKey)
    if (!storedClaims) return { claims: [], error: '' }

    const claims = JSON.parse(storedClaims)
    if (!Array.isArray(claims) || claims.some((claim) => (
      !claim
      || typeof claim.id !== 'string'
      || !uuidPattern.test(claim.id)
      || typeof claim.accessToken !== 'string'
      || !tokenPattern.test(claim.accessToken)
    ))) {
      return { claims: [], error: 'Data riwayat di perangkat tidak dapat dibaca.' }
    }

    return { claims, error: '' }
  } catch {
    return { claims: [], error: 'Penyimpanan riwayat di perangkat tidak dapat diakses.' }
  }
}

export function saveApplicationClaim(claim) {
  if (
    !claim
    || !uuidPattern.test(claim.id || '')
    || !tokenPattern.test(claim.accessToken || '')
  ) {
    return 'Data akses riwayat tidak valid.'
  }

  const { claims, error } = readApplicationClaims()
  if (error) return error

  try {
    const nextClaims = [
      claim,
      ...claims.filter((savedClaim) => savedClaim.id !== claim.id),
    ]
    window.localStorage.setItem(applicationClaimsKey, JSON.stringify(nextClaims))
    return ''
  } catch {
    return 'Akses riwayat belum dapat disimpan di perangkat ini.'
  }
}

export function removeApplicationClaim(id) {
  const { claims, error } = readApplicationClaims()
  if (error) return error

  try {
    window.localStorage.setItem(
      applicationClaimsKey,
      JSON.stringify(claims.filter((claim) => claim.id !== id)),
    )
    return ''
  } catch {
    return 'Riwayat belum dapat dihapus dari perangkat ini.'
  }
}
