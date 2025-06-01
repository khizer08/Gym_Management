document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:3000/api';
    const MEMBERS_API = `${API_BASE_URL}/members`;
    const membersTable = document.getElementById('membersTable');
    const membersList = document.getElementById('membersList');
    const searchInput = document.getElementById('searchInput');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');

    // Fetch all members
    async function fetchMembers() {
        try {
            showLoading();
            const response = await fetch(MEMBERS_API);
            const data = await response.json();
            
            if (data.success) {
                displayMembers(data.data);
            } else {
                showError(data.message || 'Failed to fetch members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            showError('Failed to fetch members. Please try again.');
        } finally {
            hideLoading();
        }
    }

    // Display members in the table
    function displayMembers(members) {
        if (!members.length) {
            membersList.innerHTML = '<tr><td colspan="7" class="text-center">No members found</td></tr>';
            return;
        }

        membersList.innerHTML = members.map(member => `
            <tr>
                <td>${member.member_id}</td>
                <td>${member.name}</td>
                <td>${member.age}</td>
                <td>${member.gender}</td>
                <td>${member.phone}</td>
                <td>${formatDate(member.membership_end)}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editMember('${member.member_id}')" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteMember('${member.member_id}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Search members
    function searchMembers(query) {
        const rows = membersList.getElementsByTagName('tr');
        query = query.toLowerCase();

        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        }
    }

    // Delete member
    async function deleteMember(memberId) {
        if (!confirm('Are you sure you want to delete this member?')) {
            return;
        }

        try {
            showLoading();
            const response = await fetch(`${MEMBERS_API}/${memberId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                alert('Member deleted successfully');
                fetchMembers(); // Refresh the list
            } else {
                showError(data.message || 'Failed to delete member');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            showError('Failed to delete member. Please try again.');
        } finally {
            hideLoading();
        }
    }

    // Edit member
    function editMember(memberId) {
        window.location.href = `edit-member.html?id=${memberId}`;
    }

    // Show loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'block';
        membersTable.style.opacity = '0.5';
    }

    // Hide loading spinner
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        membersTable.style.opacity = '1';
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        searchMembers(e.target.value);
    });

    // Initialize
    fetchMembers();
}); 