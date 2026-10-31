import { avatarUrl } from '../cloudinary'

export default function Thumb({ src, kind = 'person', size = 96, className = 'mini-photo' }) {
  if (src) return <img className={className} src={avatarUrl(src, size)} alt="" loading="lazy" />
  return (
    <span className={`${className} thumb-ph`} aria-hidden="true">
      {kind === 'person' ? (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4.2" /><path d="M3.5 21c0-4.6 3.8-8.2 8.5-8.2s8.5 3.6 8.5 8.2z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24"><path d="M11 0.5h2V2h1.5v2H13v1.6l8 5V21h-7v-6h-4v6H3V10.6l8-5V4H9.5V2H11z" /></svg>
      )}
    </span>
  )
}
