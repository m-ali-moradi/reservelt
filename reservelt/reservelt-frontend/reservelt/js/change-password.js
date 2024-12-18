BASE_URL = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    function isGraphQL() {
        return window.location.href.includes('graphql');
    }

    document.getElementById('changePasswordForm').addEventListener('submit', function (e) {
        e.preventDefault();
    
        const currentPassword = document.getElementById('current_password').value;
        const newPassword = document.getElementById('new_password').value;
        const newPasswordConfirmation = document.getElementById('new_password_confirmation').value;
    
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    
        const data = {
            currentPassword: currentPassword,
            newPassword: newPassword,
            newPasswordConfirmation: newPasswordConfirmation
        };
    
        if (isGraphQL()) {
            fetch(`${BASE_URL}/graphql`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                        mutation changePassword($changeUserPasswordDto: ChangeUserPasswordDto!) {
                            change_password(changeUserPasswordDto: $changeUserPasswordDto)
                        }
                    `,
                    variables: { changeUserPasswordDto: data },
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.errors) {
                    const firstErrorMessage = data.errors[0].message;
                    
                    const cleanErrorMessage = firstErrorMessage.replace('Invalid input: ', '').trim();
    
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = cleanErrorMessage;
                    errorMessage.style.display = 'block';
                    return;
                }

                localStorage.setItem('successMessage', 'Password changed successfully!');
                window.location.href = 'profile.html';
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = error.message || 'An error occurred while changing the password.';
                errorMessage.style.display = 'block';        
            }); 
        } else {
            fetch(`${BASE_URL}/api/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.message || 'Failed to change password.'); });
                    }
                    return null;
                })
                .then(() => {
                    localStorage.setItem('successMessage', 'Password changed successfully!');
                    window.location.href = 'profile.html';
                })
                .catch(error => {
                    console.error('Error:', error);
                    errorMessage.textContent = error.message || 'An error occurred while changing the password.';
                    errorMessage.style.display = 'block';
                });
        }        
    });
});
