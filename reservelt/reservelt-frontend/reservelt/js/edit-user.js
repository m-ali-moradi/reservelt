const BASE_URL = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    function isGraphQL() {
        return window.location.href.includes('graphql');
    }

    fetchUserData(token, isGraphQL());

    document.getElementById('editUserForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const birthDate = document.getElementById('birthDate').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;

        const data = {
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate,
            country: country,
            city: city
        };


        if (isGraphQL()) {
            data.country = parseInt(data.country, 10);
            data.city = parseInt(data.city, 10);
        }

        if (isGraphQL()) {
            fetch(`${BASE_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                    mutation($userEditDto: UserEditDto!) {
                        edit_user(userEditDto: $userEditDto) {
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
                    variables: { userEditDto: data },
                }),
            })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.errors) {
                    const firstErrorMessage = responseData.errors[0].message;
                    
                    const cleanErrorMessage = firstErrorMessage.replace('Invalid input: ', '').trim();
            
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = cleanErrorMessage;
                    errorMessage.style.display = 'block';
                    return;
                }
                
                if (responseData.data?.edit_user?.id) {
                    localStorage.setItem('successMessage', 'User details updated successfully!');
                    window.location.href = 'profile.html';
                } else {
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = 'Updating User data failed! Please check the details.';
                    errorMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = error.message || 'An error occurred while updating user details.';
                errorMessage.style.display = 'block';
            });
        } else {
            fetch(`${BASE_URL}/api/users/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                localStorage.setItem('successMessage', 'User details updated successfully!');
                window.location.href = 'profile.html';
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = error.message || 'An error occurred while updating user details.';
                errorMessage.style.display = 'block';
            });
        }
    });
});

function fetchUserData(token, isGraphQL) {

    if (isGraphQL) {
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
                            id
                            name
                        }
                        city {
                            id
                            name
                        }
                    }
                }
            ` })
        })
        .then(response => response.json())
        .then(responseData => {
            const user = responseData.data.user;

            document.getElementById('firstName').value = user.firstName;
            document.getElementById('lastName').value = user.lastName;
            document.getElementById('birthDate').value = user.birthDate;

            populateCountries(user.country.id);
            populateCities(user.country.id, user.city.id);         
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
    } else {
        fetch(`${BASE_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data.');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('firstName').value = user.firstName;
            document.getElementById('lastName').value = user.lastName;
            document.getElementById('birthDate').value = user.birthDate;
    
            populateCountries(user.country.id);
            populateCities(user.country.id, user.city.id);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
    }   
}

function populateCountries(selectedCountryId) {
    const selectedId = parseInt(selectedCountryId, 10);

    fetch(`${BASE_URL}/auth/country-list`)
        .then(response => response.json())
        .then(countries => {

            const countrySelect = document.getElementById('country');
            countrySelect.innerHTML = '<option value="">Choose Country</option>';

            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id;
                option.textContent = country.name;
                if (country.id === selectedId) {
                    option.selected = true;
                }
                countrySelect.appendChild(option);
            });

            countrySelect.addEventListener('change', function () {
                populateCities(this.value, null);
            });
        })
        .catch(error => console.error('Error fetching countries:', error));
}

function populateCities(countryId, selectedCityId) {

    const selectedId = parseInt(selectedCityId, 10);
    
    const citySelect = document.getElementById('city');
    if (!countryId) {
        citySelect.innerHTML = '<option value="">Choose City</option>';
        return;
    }

    fetch(`${BASE_URL}/auth/${countryId}/city-list`)
        .then(response => response.json())
        .then(cities => {

            citySelect.innerHTML = '<option value="">Choose City</option>';

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                if (city.id === selectedId) {
                    option.selected = true;
                }
                citySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching cities:', error);
            citySelect.innerHTML = '<option value="">Choose City</option>';
        });
}
