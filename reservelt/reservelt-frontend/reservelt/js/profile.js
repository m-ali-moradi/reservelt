const BASE_URL = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', () => {
    const successMessage = localStorage.getItem('successMessage');
    if (successMessage) {
        const messageElement = document.getElementById('successMessage');
        messageElement.textContent = successMessage;
        messageElement.style.display = 'block';
        localStorage.removeItem('successMessage');
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const errorMessage = document.getElementById('errorMessage');
    const userProfile = document.getElementById('userProfile');

    errorMessage.textContent = '';

    function isGraphQL() {
        return window.location.href.includes('graphql');
    }
    
    if (isGraphQL()) {
        fetch(`${BASE_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                query {
                    user {
                        id
                        firstName
                        lastName
                        birthDate
                        email
                        country {
                            name
                        }
                        city {
                            name
                        }
                    }
                }
            ` })
        })
        .then(response => response.json())
        .then(data => {
            if (data.errors) {
                if (data.errors[0].message.includes('Unauthorized')) {
                    errorMessage.textContent = 'Session expired. Please log in again.';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    throw new Error(data.errors[0].message);
                }
            }

            const user = data.data?.user;
            if (user) {
                document.getElementById('greeting').textContent = `Welcome, ${user.firstName}!`;
                document.getElementById('email').textContent = user.email;
                document.getElementById('firstName').textContent = user.firstName;
                document.getElementById('lastName').textContent = user.lastName;
                document.getElementById('birthDate').textContent = user.birthDate;
                document.getElementById('country').textContent = user.country.name;
                document.getElementById('city').textContent = user.city.name;
                userProfile.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            errorMessage.textContent = 'An error occurred while loading your profile.';
        });
    } else {
        fetch(`${BASE_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        errorMessage.textContent = 'Session expired. Please log in again.';
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    document.getElementById('greeting').textContent = `Welcome, ${data.firstName}!`;
                    document.getElementById('email').textContent = data.email;
                    document.getElementById('firstName').textContent = data.firstName;
                    document.getElementById('lastName').textContent = data.lastName;
                    document.getElementById('birthDate').textContent = data.birthDate;
                    document.getElementById('country').textContent = data.country.name;
                    document.getElementById('city').textContent = data.city.name;
                    userProfile.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                errorMessage.textContent = 'An error occurred while loading your profile.';
            });
    }

    document.getElementById('logoutButton').addEventListener('click', function () {
        localStorage.removeItem('authToken');
        localStorage.setItem('successMessage', 'You have been logged out successfully!');
        window.location.href = 'login.html';
    });

    document.getElementById('openDeleteModalBtn').addEventListener('click', () => {
        document.getElementById('deleteAccountModal').style.display = 'block';
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteAccountModal').style.display = 'none';
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        if (isGraphQL()) {
            fetch(`${BASE_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: `
                    mutation {
                        delete_user
                    }
                ` })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.errors) {
                        throw new Error(data.errors[0].message);
                    }
                    localStorage.removeItem('authToken');
                    localStorage.setItem('successMessage', 'Your account has been deleted successfully!');
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('Error deleting account:', error);
                    errorMessage.textContent = error.message || 'An error occurred while deleting your account.';
                    errorMessage.style.display = 'block';
                });        
        } else {
            fetch(`${BASE_URL}/api/users/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete account. Please try again.');
                    }
                    return response.text();
                })
                .then(() => {
                    localStorage.removeItem('authToken');
                    localStorage.setItem('successMessage', 'Your account has been deleted successfully!');
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('Error deleting account:', error);
                    errorMessage.textContent = error.message || 'An error occurred while deleting your account.';
                    errorMessage.style.display = 'block';
                });
        }
    });
});
