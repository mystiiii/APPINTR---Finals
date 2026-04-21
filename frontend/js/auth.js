/**
 * TimeSync — Authentication Utility Module
 * Manages JWT token storage, auth guards, role guards, and logout.
 * Must be loaded BEFORE api.js on every protected page.
 */

(function () {
  'use strict';

  var TOKEN_KEY = 'ts_access_token';
  var REFRESH_KEY = 'ts_refresh_token';
  var USER_KEY = 'ts_user';

  /* -----------------------------------------------------------------------
   * Token helpers
   * --------------------------------------------------------------------- */

  function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  }

  function setTokens(access, refresh) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* -----------------------------------------------------------------------
   * User profile helpers
   * --------------------------------------------------------------------- */

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (_) {
      return null;
    }
  }

  /* -----------------------------------------------------------------------
   * JWT payload decoding (no verification — that's server-side)
   * --------------------------------------------------------------------- */

  function decodeToken(token) {
    try {
      var parts = token.split('.');
      if (parts.length !== 3) return null;
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch (_) {
      return null;
    }
  }

  function isTokenExpired(token) {
    var payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    // Add 10-second buffer
    return Date.now() >= (payload.exp * 1000 - 10000);
  }

  /* -----------------------------------------------------------------------
   * Auth state
   * --------------------------------------------------------------------- */

  function isAuthenticated() {
    var token = getAccessToken();
    if (!token) return false;
    return !isTokenExpired(token);
  }

  /* -----------------------------------------------------------------------
   * Logout
   * --------------------------------------------------------------------- */

  function logout() {
    clearTokens();
    window.location.href = getLoginPath();
  }

  /* -----------------------------------------------------------------------
   * Path helpers — works from any page depth
   * --------------------------------------------------------------------- */

  function getLoginPath() {
    // Detect if we're inside a subdirectory (e.g. /employee/)
    if (window.location.pathname.indexOf('/employee/') !== -1 ||
        window.location.pathname.indexOf('/manager/') !== -1 ||
        window.location.pathname.indexOf('/payroll/') !== -1) {
      return '../login.html';
    }
    return 'login.html';
  }

  function getDashboardPath(role) {
    var prefix = (window.location.pathname.indexOf('/employee/') !== -1 ||
                  window.location.pathname.indexOf('/manager/') !== -1 ||
                  window.location.pathname.indexOf('/payroll/') !== -1)
                 ? '../' : '';

    if (role === 'EMPLOYEE') return prefix + 'employee/dashboard.html';
    if (role === 'MANAGER') return prefix + 'manager/dashboard.html';
    if (role === 'PAYROLL') return prefix + 'payroll/dashboard.html';
    return prefix + 'login.html';
  }

  /* -----------------------------------------------------------------------
   * Auth Guards — call at the top of every protected page
   * --------------------------------------------------------------------- */

  /** Redirect to login if not authenticated. Returns false if redirected. */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = getLoginPath();
      return false;
    }
    return true;
  }

  /**
   * Redirect to correct dashboard if user's role does not match.
   * @param {string} requiredRole - 'EMPLOYEE', 'MANAGER', or 'PAYROLL'
   */
  function requireRole(requiredRole) {
    var user = getUser();
    if (!user || user.role !== requiredRole) {
      if (user && user.role) {
        window.location.href = getDashboardPath(user.role);
      } else {
        window.location.href = getLoginPath();
      }
      return false;
    }
    return true;
  }

  /* -----------------------------------------------------------------------
   * Expose API
   * --------------------------------------------------------------------- */

  window.auth = {
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    setTokens: setTokens,
    clearTokens: clearTokens,
    setUser: setUser,
    getUser: getUser,
    isAuthenticated: isAuthenticated,
    isTokenExpired: isTokenExpired,
    logout: logout,
    requireAuth: requireAuth,
    requireRole: requireRole,
    getDashboardPath: getDashboardPath,
    getLoginPath: getLoginPath,
  };
})();
