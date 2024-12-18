<template>
    <div class="container mt-5">
      <div id="userEditForm" class="alert alert-info mt-2">
        <h2 class="form-signin-heading">Edit User</h2>
        <div v-if="successMessage" style="color: green;">{{ successMessage }}</div>
        <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
        <form id="editUserForm" class="form-signin" @submit.prevent="handleSubmit">
          <table>
            <tbody>
              <tr>
                <th><label for="firstName">First Name</label></th>
                <td>
                  <input
                    type="text"
                    id="firstName"
                    v-model="form.firstName"
                    class="form-control"
                    placeholder="First Name"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th><label for="lastName">Last Name</label></th>
                <td>
                  <input
                    type="text"
                    id="lastName"
                    v-model="form.lastName"
                    class="form-control"
                    placeholder="Last Name"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th><label for="birthDate">Birth Date</label></th>
                <td>
                  <input
                    type="date"
                    id="birthDate"
                    v-model="form.birthDate"
                    class="form-control"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th><label for="country">Country</label></th>
                <td>
                  <select
                      id="country"
                      v-model="form.country"
                      @change="fetchCities(form.country)"
                      class="form-control"
                  >
                    <option value="">Choose Country</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">
                      {{ country.name }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <th><label for="city">City</label></th>
                <td>
                  <select id="city" v-model="form.city" class="form-control">
                    <option value="">Choose City</option>
                    <option v-for="city in cities" :key="city.id" :value="city.id">
                      {{ city.name }}
                    </option>
                  </select>
                </td>
              </tr>

            </tbody>
          </table>
          <button id="submitEditButton" class="btn btn-lg btn-primary btn-block" type="submit">
            Save Changes
          </button>
          <router-link to="/profile" class="btn btn-warning">Cancel</router-link>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { toggleGraphql } from "../utils/toggleGraphql";
  
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  
  export default {
    data() {
      return {
        form: {
          firstName: "",
          lastName: "",
          birthDate: "",
          country: "",
          city: "",
        },
        countries: [],
        cities: [],
        successMessage: "",
        errorMessage: "",
      };
    },
    methods: {
      fetchUserData() {
        const token = localStorage.getItem("authToken");
        if (!token) {
          this.$router.push("/login");
          return;
        }
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        if (this.isGraphQL()) {
          fetch(`${BASE_URL}/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: `
                query {
                  user {
                    firstName
                    lastName
                    birthDate
                    country { id name }
                    city { id name }
                  }
                }
              `,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.errors) throw new Error(data.errors[0].message);
              const user = data.data.user;
              this.populateForm(user);
            })
            .catch((error) => {
              this.errorMessage = error.message;
            });
        } else {
          fetch(`${BASE_URL}/api/users`, { headers })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch user data.");
              return res.json();
            })
            .then((user) => this.populateForm(user))
            .catch((error) => {
              this.errorMessage = error.message;
            });
        }
      },
      populateForm(user) {
        this.form.firstName = user.firstName;
        this.form.lastName = user.lastName;
        this.form.birthDate = user.birthDate;
        this.fetchCountries(user.country.id);
        this.fetchCities(user.country.id, user.city.id);
      },

      fetchCountries(selectedCountryId = null) {
        fetch(`${BASE_URL}/auth/country-list`)
            .then((response) => response.json())
            .then((countries) => {
              this.countries = countries;
              if (selectedCountryId) {
                this.form.country = selectedCountryId;
              }
            })
            .catch((error) => {
              console.error("Error fetching countries:", error);
            });
      },

      fetchCities(countryId, selectedCityId = null) {
        if (!countryId) {
          this.cities = [];
          this.form.city = "";
          return;
        }

        fetch(`${BASE_URL}/auth/${countryId}/city-list`)
            .then((response) => response.json())
            .then((cities) => {
              this.cities = cities;
              if (selectedCityId) {
                this.form.city = selectedCityId;
              }
            })
            .catch((error) => {
              console.error("Error fetching cities:", error);
              this.cities = [];
            });
      },

      handleSubmit() {
        const token = localStorage.getItem("authToken");
        if (!token) {
          this.$router.push("/login");
          return;
        }
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const payload = { ...this.form };
        if (this.isGraphQL()) {
          payload.country = parseInt(payload.country, 10);
          payload.city = parseInt(payload.city, 10);
          fetch(`${BASE_URL}/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: `
                mutation($userEditDto: UserEditDto!) {
                  edit_user(userEditDto: $userEditDto) {
                    id
                  }
                }
              `,
              variables: { userEditDto: payload },
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.errors) throw new Error(data.errors[0].message);
              localStorage.setItem("successMessage", "User details updated successfully!");
              this.$router.push("/profile");
            })
            .catch((error) => {
              this.errorMessage = error.message;
            });
        } else {
          fetch(`${BASE_URL}/api/users/edit`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to update user details.");
              localStorage.setItem("successMessage", "User details updated successfully!");
              this.$router.push("/profile");
            })
            .catch((error) => {
              this.errorMessage = error.message;
            });
        }
      },
      isGraphQL() {
        return window.location.href.includes("graphql");
      },
      handleToggleGraphql() {
        toggleGraphql();
      },
    },
    mounted() {
      this.fetchUserData();
    },
  };
  </script>
  