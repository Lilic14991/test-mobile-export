
window.notifications = {
  schedule: (options = {}) => {
    window.parent.postMessage({
      type: 'schedule-notification',
      payload: {
        title: options.title || 'Notification Title',
        body: options.body || 'Notification Body',
        id: options.id || Date.now(),
        delayMs: options.delayMs || 1000,
        ...options,
      },
    }, '*');
  },

  cancel: (id) => {
    window.parent.postMessage({
      type: 'cancel-notification',
      payload: { id },
    }, '*');
  },

  getPending: () => {
    window.parent.postMessage({
      type: 'get-pending-notifications',
    }, '*');
  }
};
console.log("✅ window.notifications initialized:", window.notifications);