/**
 * TimeSync — Toast Notification System
 * Renders stacked, auto-dismissing notifications with slide-in animation.
 * Usage: showToast('Message text', 'success' | 'error' | 'warning' | 'info')
 */

(function () {
  'use strict';

  var CONTAINER_ID = 'ts-toast-container';
  var DEFAULT_DURATION = 4000;

  var VARIANTS = {
    success: {
      bg: 'bg-emerald-500/90',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    },
    error: {
      bg: 'bg-red-500/90',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    },
    warning: {
      bg: 'bg-amber-500/90',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.87-1.41L12 3z"/></svg>',
    },
    info: {
      bg: 'bg-sky-500/90',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01"/></svg>',
    },
  };

  /** Lazy-create the fixed container that holds all toasts. */
  function getContainer() {
    var el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      el.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
      el.style.maxWidth = '24rem';
      document.body.appendChild(el);
    }
    return el;
  }

  /**
   * Display a toast notification.
   * @param {string} message - The message to display.
   * @param {'success'|'error'|'warning'|'info'} type - Visual variant.
   * @param {number} [duration] - Auto-dismiss in milliseconds.
   */
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || DEFAULT_DURATION;

    var variant = VARIANTS[type] || VARIANTS.info;
    var container = getContainer();

    var toast = document.createElement('div');
    toast.className =
      variant.bg +
      ' pointer-events-auto text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 ' +
      'transform translate-x-full opacity-0 transition-all duration-300 ease-out backdrop-blur-md';

    toast.innerHTML =
      '<span class="flex-shrink-0 mt-0.5">' + variant.icon + '</span>' +
      '<span class="text-sm font-medium leading-snug flex-1">' + escapeHtml(message) + '</span>' +
      '<button class="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity" aria-label="Dismiss">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>';

    container.appendChild(toast);

    // Wire up dismiss button
    toast.querySelector('button').addEventListener('click', function () {
      dismiss(toast);
    });

    // Trigger slide-in animation on next frame
    requestAnimationFrame(function () {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Auto-dismiss
    var timer = setTimeout(function () {
      dismiss(toast);
    }, duration);

    toast._timer = timer;
  }

  /** Animate out and remove a toast element. */
  function dismiss(toast) {
    if (toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timer);
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  /** Basic HTML escaping to prevent XSS from toast messages. */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Expose globally
  window.showToast = showToast;
})();
