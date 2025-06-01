document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('editMemberForm');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    const trainerSelect = document.getElementById('assigned_trainer');

    // API endpoints
    const API_BASE_URL = 'http://localhost:3000/api';
    const MEMBERS_API = `${API_BASE_URL}/members`;

    // Get member ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        showError('No member ID provided');
        return;
    }

    // Fetch trainers from API
    async function fetchTrainers() {
        try {
            const response = await fetch(`${API_BASE_URL}/trainers`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching trainers:', error);
            return [];
        }
    }

    // Populate trainer dropdown
    async function populateTrainers() {
        const trainers = await fetchTrainers();
        trainers.forEach(trainer => {
            const option = document.createElement('option');
            option.value = trainer.id;
            option.textContent = `${trainer.name} (${trainer.specialty})`;
            trainerSelect.appendChild(option);
        });
    }

    // Fetch member details
    async function fetchMemberDetails() {
        try {
            showLoading();
            const response = await fetch(`${MEMBERS_API}/${memberId}`);
            const data = await response.json();

            if (data.success) {
                populateForm(data.data);
            } else {
                showError(data.message || 'Failed to fetch member details');
            }
        } catch (error) {
            console.error('Error fetching member details:', error);
            showError('Failed to fetch member details. Please try again.');
        } finally {
            hideLoading();
        }
    }

    // Populate form with member details
    function populateForm(member) {
        document.getElementById('member_name').value = member.name;
        document.getElementById('member_age').value = member.age;
        document.getElementById('member_gender').value = member.gender;
        document.getElementById('member_phone').value = member.phone;
        document.getElementById('member_email').value = member.email;
        document.getElementById('membership_plan').value = member.membership_plan;
        if (member.assigned_trainer_id) {
            document.getElementById('assigned_trainer').value = member.assigned_trainer_id;
        }
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        // Name validation
        const name = document.getElementById('member_name').value.trim();
        if (name.length < 2) {
            showError('member_name', 'Please enter a valid name (min 2 characters)');
            isValid = false;
        }

        // Age validation
        const age = parseInt(document.getElementById('member_age').value);
        if (isNaN(age)) {
            showError('member_age', 'Please enter a valid age');
            isValid = false;
        } else if (age < 16 || age > 100) {
            showError('member_age', 'Age must be between 16 and 100');
            isValid = false;
        }

        // Gender validation
        const gender = document.getElementById('member_gender').value;
        if (!gender) {
            showError('member_gender', 'Please select a gender');
            isValid = false;
        }

        // Phone validation
        const phone = document.getElementById('member_phone').value.trim();
        if (!/^\d{10}$/.test(phone)) {
            showError('member_phone', 'Please enter a valid phone number (10 digits)');
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('member_email').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('member_email', 'Please enter a valid email address');
            isValid = false;
        }

        // Membership plan validation
        const plan = document.getElementById('membership_plan').value;
        if (!plan) {
            showError('membership_plan', 'Please select a membership plan');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#e63946';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        
        field.parentNode.appendChild(errorElement);
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                
                // Prepare form data
                const formData = new FormData(form);
                const memberData = {
                    member_name: formData.get('member_name'),
                    member_age: parseInt(formData.get('member_age')),
                    member_gender: formData.get('member_gender'),
                    member_phone: formData.get('member_phone'),
                    member_email: formData.get('member_email'),
                    membership_plan: formData.get('membership_plan'),
                    assigned_trainer: formData.get('assigned_trainer') ? parseInt(formData.get('assigned_trainer')) : null
                };

                // Send data to API
                const response = await fetch(`${MEMBERS_API}/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(memberData)
                });

                const data = await response.json();

                if (data.success) {
                    formMessage.innerHTML = `
                        <div class="success-message">
                            <p><i class="fas fa-check-circle"></i> ${data.message}</p>
                        </div>
                    `;
                    formMessage.classList.add('success');
                    
                    // Redirect after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'members.html';
                    }, 3000);
                } else {
                    // Show validation errors
                    if (data.errors) {
                        data.errors.forEach(error => {
                            showError(error.param, error.msg);
                        });
                    }
                    formMessage.textContent = data.message || 'An error occurred';
                    formMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error:', error);
                formMessage.textContent = 'An error occurred. Please try again.';
                formMessage.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Member';
            }
        }
    });

    // Reset form
    resetBtn.addEventListener('click', function() {
        fetchMemberDetails(); // Reset to original values
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        formMessage.textContent = '';
    });

    // Show loading spinner
    function showLoading() {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    // Hide loading spinner
    function hideLoading() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Member';
    }

    // Initialize
    populateTrainers();
    fetchMemberDetails();
}); 