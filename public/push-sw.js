// Notifications push (relais Cloudflare + Firebase Cloud Messaging)
self.addEventListener('push', (event) => {
  let p = {}
  try { p = event.data ? event.data.json() : {} } catch (e) { p = {} }
  const d = p.data || p.notification || p
  const title = d.title || 'ANEG'
  const icon = self.registration.scope + 'icons/icon-192.png'
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    if (list.some((c) => c.visibilityState === 'visible')) return undefined
    return self.registration.showNotification(title, {
      body: d.body || '',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      icon,
      badge: icon,
      data: { link: d.link || '' },
    })
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = (event.notification.data && event.notification.data.link) || self.registration.scope
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if ('navigate' in c) return c.navigate(link).then((x) => (x || c).focus()).catch(() => self.clients.openWindow(link))
    }
    return self.clients.openWindow(link)
  }))
})
