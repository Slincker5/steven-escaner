self.addEventListener('install', event => {
    console.log('Service worker installing...')
    // Put your custom install steps here
  });
  
  self.addEventListener('activate', event => {
    console.log('Service worker activating...')
    // Put your custom activate steps here
  });
  
  self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  