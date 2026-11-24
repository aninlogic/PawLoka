
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
  const [showInstructions, setShowInstructions] = useState(false)
  const [platform, setPlatform] = useState('other')

  useEffect(() => {
    const userAgent = navigator.userAgent || ''

    const isIOS =
      /iPhone|iPad|iPod/i.test(userAgent) ||
      (navigator.platform === 'MacIntel' &&
        navigator.maxTouchPoints > 1)

    if (isIOS) {
      setPlatform('ios')
    } else if (/Android/i.test(userAgent)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }

    const mediaQuery = window.matchMedia(
      '(display-mode: standalone)'
    )

    const syncInstalledStatus = () => {
      if (
        mediaQuery.matches ||
        window.navigator.standalone === true
      ) {
        setIsInstalled(true)
      }
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setShowInstructions(false)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    )
    window.addEventListener('appinstalled', handleAppInstalled)
    mediaQuery.addEventListener('change', syncInstalledStatus)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      )
      mediaQuery.removeEventListener(
        'change',
        syncInstalledStatus
      )
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstructions((current) => !current)
      return
    }

    const installPrompt = deferredPrompt
    setDeferredPrompt(null)

    try {
      await installPrompt.prompt()

      const result = await installPrompt.userChoice

      if (result.outcome === 'accepted') {
        setShowInstructions(false)
      }
    } catch (error) {
      console.error('Gagal membuka prompt instalasi:', error)
      setShowInstructions(true)
    }
  }

  if (isInstalled) {
    return null
  }

  return (
    <div className="install-app-container">
      <button
        type="button"
        className="install-app-button"
        onClick={handleInstall}
        aria-expanded={showInstructions}
        aria-controls="install-app-instructions"
      >
        <Download size={17} aria-hidden="true" />
        <span>Install App</span>
      </button>

      {showInstructions && (
        <div
          className="install-app-popover"
          id="install-app-instructions"
          role="dialog"
          aria-label="Petunjuk instalasi PawLoka"
        >
          <div className="install-app-popover-heading">
            <strong>Pasang PawLoka</strong>

            <button
              type="button"
              className="install-app-close"
              onClick={() => setShowInstructions(false)}
              aria-label="Tutup petunjuk"
            >
              <X size={17} />
            </button>
          </div>

          {platform === 'ios' ? (
            <p>
              Buka PawLoka melalui Safari. Ketuk tombol Bagikan,
              pilih Tambahkan ke Layar Utama, lalu ketuk Tambah.
            </p>
          ) : platform === 'android' ? (
            <p>
              Buka menu Chrome (⋮), pilih Install app atau
              Tambahkan ke layar utama, kemudian ikuti petunjuknya.
            </p>
          ) : (
            <p>
              Di Chrome atau Edge, klik ikon instalasi pada kolom
              alamat. Kamu juga bisa membuka menu browser dan
              memilih Install PawLoka atau Install this site as an app.
            </p>
          )}
        </div>
      )}
    </div>
  )
}