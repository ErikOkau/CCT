export default defineNuxtPlugin(() => {
  if (process.client) {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add to home screen functionality
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      
      // Show install button or notification
      console.log('App can be installed');
    });

    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      deferredPrompt = null;
    });
  }
});
