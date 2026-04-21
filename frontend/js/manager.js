/**
 * TimeSync — Manager Dashboard Module
 * Handles the manager portal: viewing pending requests and
 * approving / rejecting them with confirmation.
 *
 * Dependencies: auth.js, api.js, toast.js
 */

(function () {
  'use strict';

  var allRequests = [];
  var currentPage = 1;
  var ITEMS_PER_PAGE = 10;

  /* -----------------------------------------------------------------------
   * Initialisation
   * --------------------------------------------------------------------- */

  async function init() {
    if (!window.auth.requireAuth()) return;
    if (!window.auth.requireRole('MANAGER')) return;

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
    var countEl = document.getElementById('statPendingCount');
    var hoursEl = document.getElementById('statTotalHours');
    if (countEl) countEl.textContent = allRequests.length;
    if (hoursEl) {
      var total = allRequests.reduce(function (sum, r) { return sum + parseFloat(r.hours || 0); }, 0);
      hoursEl.textContent = total.toFixed(1);
    }
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

      var rawReason = req.reason || '';
      var safeReason = rawReason.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var safeReasonData = rawReason.replace(/"/g, '&quot;');

      tr.innerHTML =
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">' + escapeHtml(empName) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">' + escapeHtml(req.date) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm text-white">' + req.hours + ' hrs</td>' +
        '<td class="px-6 py-4 text-sm text-slate-400 max-w-xs">' +
          '<div class="flex items-center gap-2">' +
            '<span class="truncate flex-1">' + safeReason + '</span>' +
            '<button onclick="window.managerDash.openModal(this)" data-reason="' + safeReasonData + '" data-name="' + escapeHtml(empName) + '" data-date="' + escapeHtml(req.date) + '" data-hours="' + req.hours + '" class="flex-shrink-0 text-xs px-2 py-1 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">Read</button>' +
          '</div>' +
        '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">' +
          '<button onclick="window.managerDash.handleApprove(' + req.id + ')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Approve</button>' +
          '<button onclick="window.managerDash.handleReject(' + req.id + ')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Reject</button>' +
        '</td>';

      tableBody.appendChild(tr);
    });
  }

  /* -----------------------------------------------------------------------
   * Actions
   * --------------------------------------------------------------------- */

  async function handleApprove(id) {
    if (!confirm('Approve this overtime request?')) return;
    var result = await window.api.approveOvertime(id);
    if (result && result.id) {
      showToast('Request approved.', 'success');
      await loadRequests();
    }
  }

  async function handleReject(id) {
    if (!confirm('Reject this overtime request?')) return;
    var result = await window.api.disapproveOvertime(id);
    if (result && result.id) {
      showToast('Request rejected.', 'success');
      await loadRequests();
    }
  }

  /* -----------------------------------------------------------------------
   * Modal
   * --------------------------------------------------------------------- */

  function openModal(btn) {
    document.getElementById('modalReasonText').textContent = btn.dataset.reason;
    document.getElementById('modalEmpName').textContent = btn.dataset.name;
    document.getElementById('modalDate').textContent = btn.dataset.date;
    document.getElementById('modalHours').textContent = btn.dataset.hours + ' hrs';
    document.getElementById('reasonModal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('reasonModal').classList.add('hidden');
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

  window.managerDash = {
    handleApprove: handleApprove,
    handleReject: handleReject,
    openModal: openModal,
    closeModal: closeModal,
    changePage: changePage,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
