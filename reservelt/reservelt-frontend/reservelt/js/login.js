BASE_URL = "http://localhost:8080"

document.addEventListener('DOMContentLoaded', function () {
  const successMessage = localStorage.getItem('successMessage');

  if (successMessage) {
      const successMessageElement = document.getElementById('successMessage');
      successMessageElement.textContent = successMessage;
      successMessageElement.style.display = 'block';

      localStorage.removeItem('successMessage');
  }
});

function isGraphQL() {
    return window.location.href.includes('graphql');
}

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    errorMessage.textContent = '';
    successMessage.textContent = '';

    if (isGraphQL()) {
        fetch(`${BASE_URL}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    mutation {
                        login_user(userLoginDto: { email: "${email}", password: "${password}" })
                    }
                `
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
            
            const token = data.data.login_user;
            if (token) {
                localStorage.setItem('authToken', token);
                successMessage.textContent = 'Login successful! Redirecting...';
                successMessage.style.display = 'block';
                window.location.href = 'profile.html';
            } else {
                throw new Error('Token missing in response');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            errorMessage.textContent = error.message || error.data || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        });  
    } else {
        fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.text();
        })
        .then(token => {
            if (token) {
                localStorage.setItem('authToken', token);
                successMessage.textContent = 'Login successful! Redirecting...';
                successMessage.style.display = 'block';
                window.location.href = 'profile.html';
            } else {
                throw new Error('Token missing in response');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            errorMessage.textContent = error.message || error.data || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        });  
    }
});