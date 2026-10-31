import { useEffect, useMemo, useState } from 'react'
import { useChurches } from '../hooks/useChurches'
import { fetchPublicChurches } from '../services/store'
import { CHURCHES } from '../data/churches'

const nf = (n) => Number(n || 0).toLocaleString('fr-FR')
const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]))
const count = (list, fn) => {
  const m = new Map()
  list.forEach((x) => { const k = fn(x); if (k) m.set(k, (m.get(k) || 0) + 1) })
  return [...m].sort((a, b) => b[1] - a[1])
}
const sum = (list, fn) => list.reduce((s, x) => s + (Number(fn(x)) || 0), 0)
const dateFr = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function ReportPanel() {
  const { churches } = useChurches()
  const [reg, setReg] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let off = false
    fetchPublicChurches().then((l) => { if (!off) setReg(l) }).catch(() => {})
    return () => { off = true }
  }, [])

  const r = useMemo(() => {
    const totaux = [
      ['Lieux de culte enregistrés', churches.length],
      ['Églises inscrites (comptes)', reg.length],
      ['Églises référencées (sources publiques)', CHURCHES.length],
      ['Communes couvertes', new Set(churches.map((c) => c.commune).filter(Boolean)).size],
      ['Ministres et prédicateurs', sum(reg, (c) => (c.ministres || []).length)],
      ['Paroisses et annexes déclarées', sum(reg, (c) => c.nbParoisses)],
      ['Fidèles déclarés (approx.)', sum(reg, (c) => c.effectif)],
    ]
    const sections = [
      { titre: 'Par dénomination', col: 'Dénomination', rows: count(churches, (c) => c.denomination) },
      { titre: 'Par commune', col: 'Commune', rows: count(churches, (c) => c.commune) },
      { titre: 'Par province (églises inscrites)', col: 'Province', rows: count(reg, (c) => c.siege?.province || 'Non précisée') },
      { titre: 'Par statut de vérification', col: 'Statut', rows: count(churches, (c) => c.statut) },
    ]
    return { totaux, sections }
  }, [churches, reg])

  const texte = () => {
    const L = [`ANEG – Rapport de synthèse du ${dateFr()}`, '']
    r.totaux.forEach(([k, v]) => L.push(`${k} : ${nf(v)}`))
    r.sections.forEach((s) => {
      if (!s.rows.length) return
      L.push('', s.titre)
      s.rows.forEach(([k, n]) => L.push(`- ${k} : ${nf(n)}`))
    })
    L.push('', 'Annuaire National des Églises du Gabon')
    return L.join('\n')
  }

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const partager = async () => {
    const t = texte()
    if (navigator.share) {
      try { await navigator.share({ title: 'ANEG – Rapport de synthèse', text: t }) } catch { /* annulé */ }
    } else {
      try { await navigator.clipboard.writeText(t); flash('Rapport copié : colle-le dans un message.') } catch { flash('Partage indisponible sur cet appareil.') }
    }
  }
  const copier = async () => {
    try { await navigator.clipboard.writeText(texte()); flash('Rapport copié.') } catch { flash('Copie impossible.') }
  }
  const csv = () => {
    const rows = [['Section', 'Libellé', 'Valeur']]
    r.totaux.forEach(([k, v]) => rows.push(['Totaux', k, v]))
    r.sections.forEach((s) => s.rows.forEach(([k, n]) => rows.push([s.titre, k, n])))
    const body = rows.map((x) => x.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' }))
    a.download = `ANEG-rapport-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }
  const imprimer = (fmt) => {
    const w = window.open('', '_blank')
    if (!w) return flash('Autorise les fenêtres pop-up pour imprimer.')
    const tot = r.totaux.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${nf(v)}</td></tr>`).join('')
    const secs = r.sections.filter((s) => s.rows.length).map((s) =>
      `<h2>${esc(s.titre)}</h2><table><tr><th>${esc(s.col)}</th><th class="n">Nombre</th></tr>${s.rows.map(([k, n]) => `<tr><td>${esc(k)}</td><td class="n">${nf(n)}</td></tr>`).join('')}</table>`).join('')
    w.document.write(`<html><head><title>ANEG – Rapport de synthèse</title><style>
@page{size:${fmt};margin:14mm}
body{font-family:sans-serif;color:#111;font-size:${fmt === 'A5' ? '10pt' : '11pt'}}
h1{color:#0b2e7a;font-size:18pt;margin:0}h2{color:#0b2e7a;font-size:13pt;margin:16px 0 4px}
.sub{color:#555;margin:2px 0 12px}table{width:100%;border-collapse:collapse}
td,th{border-bottom:1px solid #ccd;padding:4px 6px;text-align:left}.n{text-align:right;font-weight:700}
.foot{margin-top:18px;color:#666;font-size:9pt}
</style></head><body><h1>ANEG – Rapport de synthèse</h1><p class="sub">Annuaire National des Églises du Gabon · ${esc(dateFr())}</p>
<h2>Totaux</h2><table>${tot}</table>${secs}
<p class="foot">Les effectifs, paroisses et ministres sont déclarés par les églises inscrites. Les églises référencées proviennent de sources publiques et n’ont pas encore été confirmées.</p></body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <section className="panel wide rp">
      <h2>Rapports de synthèse</h2>
      <p className="hint">Situation au {dateFr()}.</p>
      <div className="rp-grid">
        {r.totaux.map(([k, v]) => (
          <div key={k} className="rp-card"><b>{nf(v)}</b><span>{k}</span></div>
        ))}
      </div>
      {r.sections.filter((s) => s.rows.length).map((s) => (
        <div key={s.titre}>
          <h3 className="sub">{s.titre}</h3>
          <table className="rp-table">
            <tbody>{s.rows.map(([k, n]) => <tr key={k}><td>{k}</td><td className="n">{nf(n)}</td></tr>)}</tbody>
          </table>
        </div>
      ))}
      <div className="btn-row">
        <button className="btn primary" onClick={partager}>Partager</button>
        <button className="btn ghost" onClick={copier}>Copier</button>
        <button className="btn ghost" onClick={csv}>Exporter CSV</button>
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={() => imprimer('A4')}>Imprimer A4</button>
        <button className="btn primary" onClick={() => imprimer('A5')}>Imprimer A5</button>
      </div>
      {msg && <p className="ok" role="status">{msg}</p>}
    </section>
  )
}
