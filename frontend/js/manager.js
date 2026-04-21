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

      var rawReason = req.reason || '';
      var safeReason = rawReason.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var safeReasonData = rawReason.replace(/"/g, '&quot;');

      tr.innerHTML =
        '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium" style="color:var(--color-text-primary);">' + escapeHtml(empName) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm" style="color:var(--color-text-secondary);">' + escapeHtml(req.date) + '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-sm" style="color:var(--color-text-primary);">' + req.hours + ' hrs</td>' +
        '<td class="px-6 py-4 text-sm max-w-xs" style="color:var(--color-text-muted);">' +
          '<div class="flex items-center gap-2">' +
            '<span class="truncate flex-1">' + safeReason + '</span>' +
            '<button onclick="window.managerDash.openModal(this)" data-reason="' + safeReasonData + '" data-name="' + escapeHtml(empName) + '" data-date="' + escapeHtml(req.date) + '" data-hours="' + req.hours + '" class="flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-colors" style="border:1px solid var(--color-btn-secondary-border);background:var(--color-btn-secondary-bg);color:var(--color-btn-secondary-text);">Read</button>' +
          '</div>' +
        '</td>' +
        '<td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">' +
          '<button onclick="window.managerDash.handleApprove(' + req.id + ')" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style="background:var(--color-badge-approved-bg);color:var(--color-badge-approved-text);border:1px solid var(--color-badge-approved-border);">Approve</button>' +
          '<button onclick="window.managerDash.handleReject(' + req.id + ')" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style="background:var(--color-badge-rejected-bg);color:var(--color-badge-rejected-text);border:1px solid var(--color-badge-rejected-border);">Reject</button>' +
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
