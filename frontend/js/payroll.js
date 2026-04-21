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
      prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
      prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
      nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
    }

    page.forEach(function (req) {
      var tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--color-row-border)';
      tr.style.transition = 'background-color 0.15s';
      tr.onmouseenter = function () { tr.style.backgroundColor = 'var(--color-row-hover)'; };
      tr.onmouseleave = function () { tr.style.backgroundColor = 'transparent'; };

      var empName = req.employee_details
        ? req.employee_details.first_name + ' ' + req.employee_details.last_name
        : 'Unknown';

      var hours = parseFloat(req.hours || 0);
      var pay = hours * BASE_HOURLY_RATE * OT_MULTIPLIER;

      tr.innerHTML =
        '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium" style="color:var(--color-text-primary);">' + escapeHtml(empName) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm" style="color:var(--color-text-secondary);">' + escapeHtml(req.date) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm" style="color:var(--color-text-primary);">' + req.hours + ' hrs</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium" style="color:var(--color-badge-approved-text);">₱' + pay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 text-xs font-medium rounded-full" style="background:var(--color-badge-approved-bg);color:var(--color-badge-approved-text);border:1px solid var(--color-badge-approved-border);">APPROVED</span></td>';

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
