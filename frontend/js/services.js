/**
 * TimeSync — API Client Module
 * Centralises all Fetch calls to the Django REST backend.
 * Automatically attaches JWT Authorization headers, handles 401 token
 * refresh, and surfaces errors through the toast system.
 *
 * Dependencies: auth.js (must be loaded first), toast.js
 */

(function () {
  'use strict';

  var API_BASE = 'http://127.0.0.1:8000/api';
  var FETCH_TIMEOUT = 10000; // 10 seconds

  /**
   * Wrapper around fetch that aborts after a timeout.
   * Prevents the UI from hanging forever if the backend is unreachable.
   */
  function fetchWithTimeout(url, options, timeout) {
    timeout = timeout || FETCH_TIMEOUT;
    var controller = new AbortController();
    options = options || {};
    options.signal = controller.signal;

    return Promise.race([
      fetch(url, options),
      new Promise(function (_, reject) {
        setTimeout(function () {
          controller.abort();
          reject(new Error('Request timed out after ' + timeout + 'ms'));
        }, timeout);
      }),
    ]);
  }

  /* -----------------------------------------------------------------------
   * Internal: authenticated fetch wrapper
   * --------------------------------------------------------------------- */

  /**
   * Perform a fetch with the JWT Authorization header.
   * If a 401 is received, attempt a token refresh once and retry.
   */
  async function authFetch(url, options) {
    options = options || {};
    options.headers = options.headers || {};

    var token = window.auth.getAccessToken();
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    var response = await fetch(url, options);

    // Handle expired access token — attempt silent refresh
    if (response.status === 401 && window.auth.getRefreshToken()) {
      var refreshed = await refreshAccessToken();
      if (refreshed) {
        options.headers['Authorization'] = 'Bearer ' + window.auth.getAccessToken();
        response = await fetch(url, options);
      } else {
        window.auth.logout();
        return null;
      }
    }

    return response;
  }

  /** Use the refresh token to obtain a new access token. */
  async function refreshAccessToken() {
    try {
      var response = await fetch(API_BASE + '/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: window.auth.getRefreshToken() }),
      });

      if (!response.ok) return false;

      var data = await response.json();
      window.auth.setTokens(data.access, data.refresh || window.auth.getRefreshToken());
      return true;
    } catch (_) {
      return false;
    }
  }

  /* -----------------------------------------------------------------------
   * Auth API
   * --------------------------------------------------------------------- */

  /**
   * POST /api/auth/login/
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  async function login(username, password) {
    try {
      console.log('[TimeSync] Logging in as', username);
      var response = await fetchWithTimeout(API_BASE + '/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password }),
      });

      var body = await response.json();
      console.log('[TimeSync] Login response status:', response.status);

      if (!response.ok) {
        var msg = body.detail || 'Invalid username or password.';
        console.warn('[TimeSync] Login failed:', msg);
        return { success: false, error: msg };
      }

      window.auth.setTokens(body.access, body.refresh);
      window.auth.setUser(body.user);
      console.log('[TimeSync] Login successful, role:', body.user.role);

      return { success: true, data: body };
    } catch (err) {
      console.error('[TimeSync] Login error:', err);
      var errorMsg = 'Network error. Please try again.';
      if (err && err.message && err.message.indexOf('timed out') !== -1) {
        errorMsg = 'Server not responding. Make sure the backend is running on port 8000.';
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * POST /api/auth/register/
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  async function register(payload) {
    try {
      console.log('[TimeSync] Registering user:', payload.username);
      var response = await fetchWithTimeout(API_BASE + '/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      var body = await response.json();
      console.log('[TimeSync] Register response status:', response.status);

      if (!response.ok) {
        // Collect all validation errors into a single message
        var errors = [];
        for (var key in body) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            var val = Array.isArray(body[key]) ? body[key].join(', ') : body[key];
            errors.push(val);
          }
        }
        var errorMsg = errors.join(' ') || 'Registration failed.';
        console.warn('[TimeSync] Registration failed:', errorMsg);
        return { success: false, error: errorMsg };
      }

      window.auth.setTokens(body.tokens.access, body.tokens.refresh);
      window.auth.setUser(body.user);
      console.log('[TimeSync] Registration successful, role:', body.user.role);

      return { success: true, data: body };
    } catch (err) {
      console.error('[TimeSync] Registration error:', err);
      var errorMsg = 'Network error. Please try again.';
      if (err && err.message && err.message.indexOf('timed out') !== -1) {
        errorMsg = 'Server not responding. Make sure the backend is running on port 8000.';
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * GET /api/auth/me/
   * Fetches the current user's profile from the server.
   */
  async function fetchProfile() {
    try {
      var response = await authFetch(API_BASE + '/auth/me/');
      if (!response || !response.ok) {
        return { success: false, error: 'Unable to fetch profile.' };
      }
      var data = await response.json();
      window.auth.setUser(data);
      return { success: true, data: data };
    } catch (_) {
      return { success: false, error: 'Network error.' };
    }
  }

  /* -----------------------------------------------------------------------
   * Overtime API
   * --------------------------------------------------------------------- */

  /** GET /api/overtime/ — filtered by role on the backend. */
  async function fetchOvertimeRequests() {
    try {
      var response = await authFetch(API_BASE + '/overtime/');
      if (!response || !response.ok) {
        if (typeof showToast === 'function') showToast('Failed to load overtime data.', 'error');
        return [];
      }
      return await response.json();
    } catch (_) {
      if (typeof showToast === 'function') showToast('Network error loading data.', 'error');
      return [];
    }
  }

  /** POST /api/overtime/submit/ */
  async function submitOvertime(data) {
    try {
      var response = await authFetch(API_BASE + '/overtime/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response) return null;

      var body = await response.json();

      if (!response.ok) {
        var errors = [];
        for (var key in body) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            var val = Array.isArray(body[key]) ? body[key].join(', ') : body[key];
            errors.push(val);
          }
        }
        if (typeof showToast === 'function') showToast(errors.join(' ') || 'Submission failed.', 'error');
        return null;
      }

      return body;
    } catch (_) {
      if (typeof showToast === 'function') showToast('Network error.', 'error');
      return null;
    }
  }

  /** PATCH /api/overtime/approve/<id>/ */
  async function approveOvertime(id) {
    try {
      var response = await authFetch(API_BASE + '/overtime/approve/' + id + '/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response) return null;
      if (!response.ok) {
        if (typeof showToast === 'function') showToast('Failed to approve request.', 'error');
        return null;
      }
      return await response.json();
    } catch (_) {
      if (typeof showToast === 'function') showToast('Network error.', 'error');
      return null;
    }
  }

  /** PATCH /api/overtime/disapprove/<id>/ */
  async function disapproveOvertime(id) {
    try {
      var response = await authFetch(API_BASE + '/overtime/disapprove/' + id + '/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response) return null;
      if (!response.ok) {
        if (typeof showToast === 'function') showToast('Failed to reject request.', 'error');
        return null;
      }
      return await response.json();
    } catch (_) {
      if (typeof showToast === 'function') showToast('Network error.', 'error');
      return null;
    }
  }

  /* -----------------------------------------------------------------------
   * Expose API
   * --------------------------------------------------------------------- */

  window.api = {
    login: login,
    register: register,
    fetchProfile: fetchProfile,
    fetchOvertimeRequests: fetchOvertimeRequests,
    submitOvertime: submitOvertime,
    approveOvertime: approveOvertime,
    disapproveOvertime: disapproveOvertime,
  };
})();
