import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { speciesNames } from './pet-format'

const statusNames = {
  pending: 'Menunggu Konfirmasi',
  reviewing: 'Sedang Diproses',
  approved: 'Disetujui',
  declined: 'Ditolak',
  closed: 'Ditutup',
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }

    return entities[character]
  })
}

function formatDate(value) {
  if (!value) return 'Tanggal belum tersedia'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Tanggal belum tersedia'
  }

  return date.toLocaleDateString('id-ID', {
    dateStyle: 'long',
  })
}

function createField(label, value, wide = false) {
  const content = String(value ?? '').trim() || 'Data tidak tersedia'

  return `
    <div class="receipt-field ${wide ? 'receipt-field--wide' : ''}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(content)}</strong>
    </div>
  `
}

function createReceiptElement(application, id) {
  const pet = application.pet
  const shelter = application.shelter

  const petSpecies = pet?.species
    ? speciesNames[pet.species] || pet.species
    : ''

  const petDescription = [
    pet?.name || 'Hewan pilihan',
    petSpecies,
  ].filter(Boolean).join(' · ')

  const status = statusNames[application.status]
    || 'Status belum tersedia'

  const fields = [
    createField('Nama calon adopter', application.applicant_name),
    createField('Domisili', application.domicile),
    createField('Hewan yang dipilih', petDescription),
    createField('Shelter', shelter?.name),
    createField('Tanggal pengajuan', formatDate(application.created_at)),
    createField('Alasan ingin mengadopsi', application.adoption_reason, true),
    createField('Pengalaman memelihara hewan', application.pet_experience, true),
  ]

  if (application.message) {
    fields.push(
      createField('Catatan tambahan', application.message, true),
    )
  }

  const root = document.createElement('div')

  root.id = 'pawloka-export-document'
  root.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 760px;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
  `

  root.innerHTML = `
    <style>
      #pawloka-export-document,
      #pawloka-export-document * {
        box-sizing: border-box;
      }

      #pawloka-export-document .receipt-sheet {
  width: 760px;
  padding: 38px;
  color: #244b38;
  background: #fffdf6;
  font-family: Arial, Helvetica, sans-serif;
}

#pawloka-export-document .receipt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 2px solid #dce9df;
}

#pawloka-export-document .receipt-brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
     #pawloka-export-document .receipt-logo {
  display: block;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 12px;
}

#pawloka-export-document .receipt-brand {
  margin: 0;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -1px;
}

#pawloka-export-document .receipt-tagline {
  margin: 4px 0 0;
  color: #718477;
  font-size: 12px;
}

#pawloka-export-document .receipt-heading {
  padding: 24px 0 18px;
}

      #pawloka-export-document .receipt-eyebrow {
        color: #bd684e;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      #pawloka-export-document .receipt-heading h1 {
  margin: 10px 0 7px;
  color: #244b38;
  font-size: 31px;
  line-height: 1.2;
}

      #pawloka-export-document .receipt-heading p {
        margin: 0;
        color: #718477;
        font-size: 14px;
        line-height: 1.6;
      }

      #pawloka-export-document .receipt-status {
  display: inline-block;
  flex-shrink: 0;
  max-width: 220px;
  padding: 9px 14px;
  border-radius: 999px;
  color: #285d38;
  background: #e8f4e3;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

      #pawloka-export-document .receipt-id {
  margin: 4px 0 22px;
  padding: 13px 17px;
  border-radius: 13px;
  background: #edf4ed;
}

      #pawloka-export-document .receipt-id span {
        display: block;
        margin-bottom: 6px;
        color: #718477;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      #pawloka-export-document .receipt-id strong {
        color: #244b38;
        font-size: 15px;
        overflow-wrap: anywhere;
      }

      #pawloka-export-document .receipt-section h2 {
        margin: 0 0 15px;
        padding-bottom: 11px;
        border-bottom: 1px solid #dce9df;
        color: #244b38;
        font-size: 18px;
      }

      #pawloka-export-document .receipt-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

      #pawloka-export-document .receipt-field {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e4e9df;
  border-radius: 12px;
  background: #fff;
}

      #pawloka-export-document .receipt-field--wide {
        grid-column: 1 / -1;
      }

      #pawloka-export-document .receipt-field span {
        display: block;
        margin-bottom: 8px;
        color: #718477;
        font-size: 11px;
        font-weight: 700;
      }

      #pawloka-export-document .receipt-field strong {
        display: block;
        color: #244b38;
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      #pawloka-export-document .receipt-footer {
  margin-top: 23px;
  padding-top: 15px;
  border-top: 1px solid #dce9df;
  color: #718477;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
}
    </style>

    <article class="receipt-sheet">
<header class="receipt-header">
  <div class="receipt-brand-group">
    <img
      class="receipt-logo"
      src="/pawloka-192.png"
      alt="Logo PawLoka"
    />

    <div>
      <p class="receipt-brand">PawLoka</p>
      <p class="receipt-tagline">
        Temukan sahabat, mulai perjalanan baru
      </p>
    </div>
  </div>

  <span class="receipt-status">
    ${escapeHtml(status)}
  </span>
</header>

<section class="receipt-heading">
  <span class="receipt-eyebrow">BUKTI PENGAJUAN ADOPSI</span>

  <h1>Detail Pengajuan Adopsi</h1>

  <p>
    Dokumen ini berisi informasi pengajuan adopsi
    yang telah dikirimkan melalui PawLoka.
  </p>
</section>

      <div class="receipt-id">
        <span>Nomor pengajuan</span>
        <strong>${escapeHtml(id)}</strong>
      </div>

      <section class="receipt-section">
        <h2>Informasi Pengajuan</h2>

        <div class="receipt-fields">
          ${fields.join('')}
        </div>
      </section>

      <footer class="receipt-footer">
        Dokumen ini dibuat secara otomatis oleh PawLoka
        sebagai salinan informasi pengajuan adopsi.
        <br />
        Simpan dokumen ini untuk keperluan pencatatan pribadi.
      </footer>
    </article>
  `

  return root
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Gambar tidak berhasil dibuat.'))
      }
    }, 'image/png')
  })
}

function downloadPdf(canvas, filename) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 10

  const availableWidth = pageWidth - margin * 2
  const availableHeight = pageHeight - margin * 2

  const scale = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height,
  )

  const imageWidth = canvas.width * scale
  const imageHeight = canvas.height * scale

  const x = (pageWidth - imageWidth) / 2
  const y = (pageHeight - imageHeight) / 2

  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    x,
    y,
    imageWidth,
    imageHeight,
    undefined,
    'FAST',
  )

  pdf.save(filename)
}

export async function downloadApplicationFile({
  application,
  id,
  format,
}) {
  if (!application || !id) {
    throw new Error('Data pengajuan tidak tersedia.')
  }

  if (!['pdf', 'png'].includes(format)) {
    throw new Error('Format file tidak didukung.')
  }

  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '')
  const filename = `pawloka-pengajuan-${safeId || 'receipt'}`

  const receipt = createReceiptElement(application, id)

  document.body.appendChild(receipt)

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const images = Array.from(receipt.querySelectorAll('img'))

    await Promise.all(
      images.map(async (image) => {
        if (typeof image.decode === 'function') {
          await image.decode()
        } else if (!image.complete) {
          await new Promise((resolve, reject) => {
            image.addEventListener('load', resolve, { once: true })
            image.addEventListener(
              'error',
              () => reject(new Error('Gambar gagal dimuat.')),
              { once: true },
            )
          })
        }

        if (!image.naturalWidth) {
          throw new Error('Logo PawLoka gagal dimuat.')
        }
      }),
    )

    const canvas = await html2canvas(receipt, {
      scale: 2,
      backgroundColor: '#fffdf6',
      useCORS: true,
      logging: false,
      onclone: (clonedDocument) => {
        const clonedReceipt = clonedDocument.getElementById(
          'pawloka-export-document',
        )

        if (clonedReceipt) {
          clonedReceipt.style.opacity = '1'
          clonedReceipt.style.zIndex = '999999'
        }
      },
    })

    if (format === 'png') {
      const blob = await canvasToBlob(canvas)
      downloadBlob(blob, `${filename}.png`)
      return
    }

    downloadPdf(canvas, `${filename}.pdf`)
  } finally {
    receipt.remove()
  }
}