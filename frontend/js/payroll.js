/**
 * TimeSync — Payroll Dashboard Module
 * Handles the payroll portal: viewing approved timesheets,
 * pay scaling calculations, and summary statistics.
 *
 * Dependencies: auth.js, api.js, toast.js
 */

(function () {
  'use strict';

  var allRequests = [];
  var currentPage = 1;
  var ITEMS_PER_PAGE = 10;

  /* Pay configuration */
  var BASE_HOURLY_RATE = 250.00;
  var OT_MULTIPLIER = 1.5;

  /* -----------------------------------------------------------------------
   * Initialisation
   * --------------------------------------------------------------------- */

  async function init() {
    if (!window.auth.requireAuth()) return;
    if (!window.auth.requireRole('PAYROLL')) return;

    populateUserNav();
    await loadRequests();
  }

  function populateUserNav() {
    var user = window.auth.getUser();
    if (!user) return;
    var el = document.getElementById('navUserName');
    if (el) el.textContent = user.first_name + ' ' + user.last_name;
  }

  /* -----------------------------------------------------------------------
   * Data Loading
   * --------------------------------------------------------------------- */

  async function loadRequests() {
    allRequests = await window.api.fetchOvertimeRequests();
    currentPage = 1;
    renderTable();
    updateStats();
  }

  /* -----------------------------------------------------------------------
   * Stats Cards
   * --------------------------------------------------------------------- */

  function updateStats() {
    var totalHours = allRequests.reduce(function (sum, r) { return sum + parseFloat(r.hours || 0); }, 0);
    var totalPay = totalHours * BASE_HOURLY_RATE * OT_MULTIPLIER;

    /* Unique employees */
    var empSet = {};
    allRequests.forEach(function (r) {
      if (r.employee_details) empSet[r.employee_details.id] = true;
    });
    var uniqueEmployees = Object.keys(empSet).length;

    var elCount = document.getElementById('statApprovedCount');
    var elHours = document.getElementById('statTotalHours');
    var elEmployees = document.getElementById('statUniqueEmployees');
    var elPayout = document.getElementById('statTotalPayout');

    if (elCount) elCount.textContent = allRequests.length;
    if (elHours) elHours.textContent = totalHours.toFixed(1);
    if (elEmployees) elEmployees.textContent = uniqueEmployees;
    if (elPayout) elPayout.textContent = '₱' + totalPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* -----------------------------------------------------------------------
   * Table Rendering
   * --------------------------------------------------------------------- */

  function renderTable() {
    var tableBody = document.getElementById('overtimeTableBody');
    var emptyState = document.getElementById('emptyState');
    var paginationContainer = document.getElementById('paginationContainer');

    tableBody.innerHTML = '';

    if (allRequests.length === 0) {
      emptyState.classList.remove('hidden');
      paginationContainer.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    paginationContainer.classList.remove('hidden');

    var totalItems = allRequests.length;
    var totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    var endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    var page = allRequests.slice(startIndex, endIndex);

    document.getElementById('pageStart').textContent = totalItems === 0 ? 0 : startIndex + 1;
    document.getElementById('pageEnd').textContent = endIndex;
    document.getElementById('pageTotal').textContent = totalItems;

    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
      prevBtn.className = 'relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium transition-colors ' +
        (currentPage === 1
          ? 'border-slate-700 bg-slate-800/50 text-slate-600 cursor-not-allowed'
          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700');
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.className = 'relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium transition-colors ' +
        (currentPage === totalPages
          ? 'border-slate-700 bg-slate-800/50 text-slate-600 cursor-not-allowed'
          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700');
    }

    page.forEach(function (req) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700/50 hover:bg-white/[0.02] transition-colors';

      var empName = req.employee_details
        ? req.employee_details.first_name + ' ' + req.employee_details.last_name
        : 'Unknown';

      var hours = parseFloat(req.hours || 0);
      var pay = hours * BASE_HOURLY_RATE * OT_MULTIPLIER;

      tr.innerHTML =
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">' + escapeHtml(empName) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">' + escapeHtml(req.date) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-white">' + req.hours + ' hrs</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">₱' + pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVED</span></td>';

      tableBody.appendChild(tr);
    });
  }

  /* -----------------------------------------------------------------------
   * Helpers
   * --------------------------------------------------------------------- */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function changePage(delta) {
    currentPage += delta;
    renderTable();
  }

  /* -----------------------------------------------------------------------
   * Expose & Boot
   * --------------------------------------------------------------------- */

  window.payrollDash = {
    changePage: changePage,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
