import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const FORMATS = { A6: ['105mm', '148mm'], A5: ['148mm', '210mm'], A4: ['210mm', '297mm'] }
const esc = (s) => String(s).replace(/[<>&"]/g, '')

export default function QrCode({ url, title = 'ANEG', code = '', canExpand = false, size = 96 }) {
  const [src, setSrc] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(url, { margin: 2, width: 1024, errorCorrectionLevel: 'M' })
      .then((d) => { if (ok) setSrc(d) })
    return () => { ok = false }
  }, [url])

  const fname = esc(code || title).replace(/\s+/g, '-')

  const savePng = () => {
    const a = document.createElement('a')
    a.href = src; a.download = `${fname}.png`; a.click()
  }
  const saveSvg = async () => {
    const svg = await QRCode.toString(url, { type: 'svg', margin: 2 })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    a.download = `${fname}.svg`; a.click()
  }
  const print = (fmt) => {
    const [w, h] = FORMATS[fmt]
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>${esc(title)}</title><style>
@page{size:${fmt};margin:0}
body{margin:0;width:${w};height:${h};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center}
img{width:70%}h1{font-size:22pt;margin:8mm}p{font-size:14pt;letter-spacing:2px;margin:2mm}
</style></head><body><h1>${esc(title)}</h1><img src="${src}"><p>${esc(code)}</p>
<p style="font-size:10pt;letter-spacing:0">Scannez avec l’appareil photo</p></body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  if (!src) return null
  const img = <img src={src} alt={`QR ${title}`} width={size} height={size} className="qr-img" />

  return (
    <>
      {canExpand
        ? <button type="button" className="qr-thumb" onClick={() => setOpen(true)} aria-label="Agrandir le QR code">{img}</button>
        : <div className="qr-thumb static">{img}</div>}
      {code && <div className="qr-code">{code}</div>}
      {open && (
        <div className="qr-full" onClick={() => setOpen(false)}>
          <div className="qr-box" onClick={(e) => e.stopPropagation()}>
            <h3>{title}</h3>
            <img src={src} alt={`QR ${title}`} />
            {code && <p className="qr-code big">{code}</p>}
            <div className="btn-row">
              <button className="btn ghost" onClick={savePng}>PNG</button>
              <button className="btn ghost" onClick={saveSvg}>SVG</button>
            </div>
            <div className="btn-row">
              {Object.keys(FORMATS).map((f) => (
                <button key={f} className="btn primary" onClick={() => print(f)}>Imprimer {f}</button>
              ))}
            </div>
            <button className="btn ghost block" onClick={() => setOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  )
}
