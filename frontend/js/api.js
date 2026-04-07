const API_BASE = 'http://127.0.0.1:8000/api';

async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE}/users/`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchOvertimeRequests() {
    try {
        const response = await fetch(`${API_BASE}/overtime/`);
        if (!response.ok) throw new Error('Failed to fetch overtime requests');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function submitOvertime(data) {
    try {
        const response = await fetch(`${API_BASE}/overtime/submit/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit overtime');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function approveOvertime(id, managerId) {
    try {
        const payload = managerId ? { manager_id: managerId } : {};
        const response = await fetch(`${API_BASE}/overtime/approve/${id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to approve overtime');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

window.api = { fetchUsers, fetchOvertimeRequests, submitOvertime, approveOvertime };
