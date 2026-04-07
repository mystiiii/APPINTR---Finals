let allUsers = [];
let allRequests = [];
let currentUser = null;

async function initDashboard() {
    allUsers = await window.api.fetchUsers();
    allRequests = await window.api.fetchOvertimeRequests();
    
    const roleSelect = document.getElementById('userRoleSelect');
    roleSelect.innerHTML = '';
    
    allUsers.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user.id;
        opt.textContent = `${user.first_name} ${user.last_name} (${user.role})`;
        roleSelect.appendChild(opt);
    });

    if (allUsers.length > 0) {
        currentUser = allUsers[0];
        roleSelect.value = currentUser.id;
    }

    roleSelect.addEventListener('change', (e) => {
        currentUser = allUsers.find(u => u.id == e.target.value);
        renderView();
    });

    renderView();
}

function renderView() {
    if (!currentUser) return;

    const role = currentUser.role;
    const titleEl = document.getElementById('viewTitle');
    const tableBody = document.getElementById('overtimeTableBody');
    const emptyState = document.getElementById('emptyState');
    const actionBtns = document.getElementById('actionButtons');
    const actionHeader = document.getElementById('actionHeader');

    // Reset Table
    tableBody.innerHTML = '';
    actionBtns.innerHTML = '';
    actionHeader.classList.add('hidden');

    let filteredRequests = [];

    if (role === 'EMPLOYEE') {
        titleEl.textContent = 'My Overtime Requests';
        filteredRequests = allRequests.filter(r => r.employee_details && r.employee_details.id === currentUser.id);
        
        let submitBtn = document.createElement('a');
        submitBtn.href = 'submit.html';
        submitBtn.className = 'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none';
        submitBtn.textContent = 'Submit Overtime';
        actionBtns.appendChild(submitBtn);

    } else if (role === 'MANAGER') {
        titleEl.textContent = 'Pending Approvals';
        filteredRequests = allRequests.filter(r => r.status === 'PENDING');
        actionHeader.classList.remove('hidden');

    } else if (role === 'PAYROLL') {
        titleEl.textContent = 'Approved Timesheets (For Processing)';
        filteredRequests = allRequests.filter(r => r.status === 'APPROVED');
    }

    if (filteredRequests.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filteredRequests.forEach(req => {
            const tr = document.createElement('tr');
            
            const empName = req.employee_details ? `${req.employee_details.first_name} ${req.employee_details.last_name}` : 'Unknown';
            
            // Status Badge Colors (Minimalist)
            let statusColor = 'bg-gray-100 text-gray-800';
            if (req.status === 'APPROVED') statusColor = 'bg-gray-200 text-gray-900 font-semibold';
            if (req.status === 'PENDING') statusColor = 'bg-white border border-gray-300 text-gray-600';

            const statusBadge = `<span class="px-2 inline-flex text-xs leading-5 rounded-full ${statusColor}">${req.status}</span>`;

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${empName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${req.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${req.hours} hrs</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${req.reason}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
            `;

            if (role === 'MANAGER') {
                const tdAction = document.createElement('td');
                tdAction.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                
                const approveBtn = document.createElement('button');
                approveBtn.textContent = 'Approve';
                approveBtn.className = 'text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1 bg-white hover:bg-gray-50 transition-colors duration-150';
                approveBtn.onclick = () => handleApprove(req.id);
                
                tdAction.appendChild(approveBtn);
                tr.appendChild(tdAction);
            }

            tableBody.appendChild(tr);
        });
    }
}

async function handleApprove(requestId) {
    if(!currentUser) return;
    const res = await window.api.approveOvertime(requestId, currentUser.id);
    if(res && res.id) {
        // Refresh data
        allRequests = await window.api.fetchOvertimeRequests();
        renderView();
    } else {
        alert("Failed to approve request.");
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
