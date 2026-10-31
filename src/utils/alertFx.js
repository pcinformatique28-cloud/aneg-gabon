const PREFS = 'aneg_alerts_prefs'
export const getPrefs = () => {
  try { return { sound: true, vibrate: true, ...JSON.parse(localStorage.getItem(PREFS) || '{}') } }
  catch { return { sound: true, vibrate: true } }
}

let audio = null
let unlocked = false
export function initFx(soundUrl) {
  if (audio) return
  audio = new Audio(soundUrl)
  audio.preload = 'auto'
  const unlock = () => { unlocked = true; window.removeEventListener('pointerdown', unlock) }
  window.addEventListener('pointerdown', unlock)
}
export function ring() {
  const p = getPrefs()
  if (p.sound && unlocked && audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
  if (p.vibrate && 'vibrate' in navigator) navigator.vibrate([200, 100, 200])
}
export function setBadge(n) {
  try {
    if (n > 0) Promise.resolve(navigator.setAppBadge?.(n)).catch(() => {})
    else Promise.resolve(navigator.clearAppBadge?.()).catch(() => {})
  } catch { /* ignore */ }
}
