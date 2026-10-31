// Envoi de fichiers vers Cloudinary (preset « unsigned » défini dans le fichier .env).
const cloud = () => import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const preset = () => import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
// Preset séparé (recommandé) pour les documents administratifs ; à défaut, le preset général.
const docsPreset = () => import.meta.env.VITE_CLOUDINARY_DOCS_PRESET || preset()

async function send(file, folder, presetName) {
  if (!cloud() || !presetName) throw new Error('Cloudinary n’est pas configuré (fichier .env).')
  if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop lourd (5 Mo maximum).')
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', presetName)
  body.append('folder', folder)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud()}/auto/upload`, { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || 'Échec de l’envoi du fichier.')
  return { url: json.secure_url, publicId: json.public_id, resourceType: json.resource_type, nom: file.name }
}

export async function uploadImage(file, folder = 'aneg') {
  if (!file.type.startsWith('image/')) throw new Error('Choisis une image (jpg, png ou webp).')
  return (await send(file, folder, preset())).url
}

// Documents administratifs : images ou PDF.
export async function uploadDocument(file, folder = 'aneg/documents') {
  const ok = file.type.startsWith('image/') || file.type === 'application/pdf'
  if (!ok) throw new Error('Formats acceptés : PDF, jpg, png ou webp.')
  return send(file, folder, docsPreset())
}

// Version carrée recadrée sur le visage, pour les avatars.
export function avatarUrl(url, size = 160) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/c_fill,g_face,w_${size},h_${size},f_auto,q_auto/`)
}
