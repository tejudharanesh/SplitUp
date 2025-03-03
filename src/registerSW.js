import { registerSW } from "virtual:pwa-register";

export function registerSW() {
  if ("serviceWorker" in navigator) {
    // Register the service worker
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm("New content available. Reload?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });
  }
}
