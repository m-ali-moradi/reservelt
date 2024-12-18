const BASE_URL = "http://localhost:8080";

fetch(`${BASE_URL}/auth/country-list`)
    .then(response => response.json())
    .then(countries => {
        const countrySelect = document.getElementById('country');
        countrySelect.innerHTML = '<option value="">Choose Country</option>';

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });

        const selectedCountry = countrySelect.value;
        if (selectedCountry) {
            populateCities(selectedCountry);
        }
    })
    .catch(error => console.error('Error fetching countries:', error));

document.getElementById('country').addEventListener('change', function () {
    const countryId = this.value;
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">Choose City</option>';
        
    if (countryId) {
        fetch(`${BASE_URL}/auth/${countryId}/city-list`)
            .then(response => response.json())
            .then(cities => {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching cities:', error));
    }
});

function isGraphQL() {
    return window.location.href.includes('graphql');
}

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const jsonData = Object.fromEntries(formData.entries());

    if (isGraphQL()) {
        jsonData.country = parseInt(jsonData.country, 10);
        jsonData.city = parseInt(jsonData.city, 10);
    }

    if (isGraphQL()) {
        fetch(`${BASE_URL}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                mutation($userRegisterDto: UserRegisterDto!) {
                    register_user(userRegisterDto: $userRegisterDto) {
                        id
                        firstName
                        lastName
                        email
                        country {
                            id
                            name
                        }
                        city {
                            id
                            name
                        }
                    }
                }`,
                variables: { userRegisterDto: jsonData },
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

            if (data.data?.register_user?.id) {
                localStorage.setItem('successMessage', 'Successfully Registered!');
                window.location.href = 'login.html';
            } else {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = 'Registration failed! Please check the details.';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = error.message || 'Registration failed!';
            errorMessage.style.display = 'block';
            console.error('Error during registration:', error);
        }); 
    } else {
        fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                localStorage.setItem('successMessage', 'Successfully Registered!');
                window.location.href = 'login.html';
            } else {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = data.error || 'Registration failed!';
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = error.message || 'Registration failed!';
            errorMessage.style.display = 'block';
            console.error('Error during registration:', error);
        }); 
    }
});
