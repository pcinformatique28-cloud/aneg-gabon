// Envoi d'images vers Cloudinary (preset « unsigned » défini dans le fichier .env).
export async function uploadImage(file, folder = 'aneg') {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) throw new Error('Cloudinary n’est pas configuré (fichier .env).')
  if (!file.type.startsWith('image/')) throw new Error('Choisis une image (jpg, png ou webp).')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image trop lourde (5 Mo maximum).')

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', preset)
  body.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || 'Échec de l’envoi de l’image.')
  return json.secure_url
}

// Version carrée recadrée sur le visage, pour les avatars.
export function avatarUrl(url, size = 160) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/c_fill,g_face,w_${size},h_${size},f_auto,q_auto/`)
}
