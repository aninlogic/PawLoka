import { whatsappNumber } from '../config/whatsapp'
import { speciesNames } from './pet-format'

export function createPetWhatsAppMessage(pet, applicant) {
  const lines = [
    `Halo PawLoka, saya tertarik untuk mengajukan adopsi hewan bernama ${pet.name}.`,
    `Jenis hewan: ${speciesNames[pet.species] || pet.species}`,
    ...(pet.shelter?.name ? [`Shelter asal: ${pet.shelter.name}`] : []),
  ]

  if (applicant) {
    lines.push(
      `Nama calon adopter: ${applicant.applicant_name}`,
      `Domisili: ${applicant.domicile}`,
      `Alasan adopsi: ${applicant.adoption_reason}`,
      `Pengalaman memelihara: ${applicant.pet_experience}`,
    )
    if (applicant.message) lines.push(`Catatan tambahan: ${applicant.message}`)
  }

  lines.push('', 'Mohon informasi lebih lanjut mengenai proses adopsinya.', '', 'Terima kasih.')
  return lines.join('\n')
}

export function createPetWhatsAppUrl(pet, applicant) {
  const message = createPetWhatsAppMessage(pet, applicant)
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
