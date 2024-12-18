<template>
    <div class="container">
      <h2 class="form-signin-heading">Registration</h2>
      <span v-if="errorMessage" style="color: red;">{{ errorMessage }}</span>
  
      <form @submit.prevent="handleSubmit">
        <p>
          <label for="firstname" class="sr-only">First Name</label>
          <input
            type="text"
            id="firstname"
            v-model="form.firstName"
            class="form-control"
            placeholder="First Name"
            required
          />
        </p>
        <p>
          <label for="lastname" class="sr-only">Last Name</label>
          <input
            type="text"
            id="lastname"
            v-model="form.lastName"
            class="form-control"
            placeholder="Last Name"
            required
          />
        </p>
        <p>
          <label for="birthDate">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            v-model="form.birthDate"
            class="form-control"
            required
          />
        </p>
        <p>
          <label for="country">Country</label>
          <select v-model="form.country" @change="fetchCities" class="form-control-select">
            <option value="">Choose Country</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </select>
        </p>
        <p>
          <label for="city">City</label>
          <select v-model="form.city" class="form-control-select">
            <option value="">Choose City</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>
        </p>
        <p>
          <label for="email" class="sr-only">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-control"
            placeholder="Email"
            required
          />
        </p>

        <p>
          <label for="password" class="sr-only">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-control"
            placeholder="Password"
            required
          />
        </p>
        <p>
          <label for="passwordConfirmation" class="sr-only">Password Confirmation</label>
          <input
            type="password"
            id="passwordConfirmation"
            v-model="form.passwordConfirmation"
            class="form-control"
            placeholder="Password Confirmation"
            required
          />
        </p>
        <div class="btn-container">
          <button type="submit" class="btn">Sign up</button>
        </div>
      </form>
      <div class="bottom_btns">
        <p><a href="/profile">Already have an account?</a></p>
        <button @click="handleToggleGraphql" class="btn btn-primary">Toggle graphql</button>
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
            email: "",
            password: "",
            passwordConfirmation: "",
          },
          countries: [],
          cities: [],
          errorMessage: "",
        };
      },
      methods: {
        fetchCountries() {
          fetch(`${BASE_URL}/auth/country-list`)
            .then((response) => response.json())
            .then((data) => {
              this.countries = data;
            })
            .catch((error) => {
              console.error("Error fetching countries:", error);
            });
        },
        fetchCities() {
          if (!this.form.country) return;
    
          fetch(`${BASE_URL}/auth/${this.form.country}/city-list`)
            .then((response) => response.json())
            .then((data) => {
              this.cities = data;
            })
            .catch((error) => {
              console.error("Error fetching cities:", error);
            });
        },
        handleSubmit() {
          if (this.isGraphql()) {
            const payload = {
              query: `
                mutation RegisterUser($userRegisterDto: UserRegisterDto!) {
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
                }
              `,
              variables: {
                userRegisterDto: this.form
              }
            };
            fetch(`${BASE_URL}/graphql`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
                .then(async (response) => {
                  const responseData = await response.json();
                  if (!response.ok || responseData.errors) {
                    const firstErrorMessage = responseData.errors?.[0]?.message || "Registration failed!";
                    const cleanErrorMessage = firstErrorMessage.replace('Invalid input: ', '').trim();
                    throw new Error(cleanErrorMessage);
                  }
                  return responseData.data.register_user;
                })
                .then((data) => {
                  if (data?.id) {
                    localStorage.setItem("successMessage", "Successfully Registered!");
                    window.location.href = "/login";
                  }
                })
                .catch((error) => {
                  this.errorMessage = error.message;
                  console.error("Error during registration:", error);
                });

          } else {
            const payload = JSON.stringify(this.form);

            fetch(`${BASE_URL}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
            })
                .then(async (response) => {
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Registration failed!");
                  }
                  return response.json();
                })
                .then((data) => {
                  if (data.id) {
                    localStorage.setItem("successMessage", "Successfully Registered!");
                    window.location.href = "/login";
                  }
                })
                .catch((error) => {
                  this.errorMessage = error.message;
                  console.error("Error during registration:", error);
                });
          }
        },
        handleToggleGraphql() {
          toggleGraphql();
        },
        isGraphql() {
          return window.location.href.includes('graphql');
        },
      },
      mounted() {
        this.fetchCountries();
      },
    };
  </script>
