<template>
    <div class="container">
      <form @submit.prevent="handleChangePassword" class="form-signin">
        <h2 class="form-signin-heading">Change Password</h2>
        <div v-if="successMessage" style="color: green;">{{ successMessage }}</div>
        <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
  
        <p>
          <label for="current_password" class="sr-only">Current Password</label>
          <input
            type="password"
            id="current_password"
            v-model="form.currentPassword"
            class="form-control"
            placeholder="Current Password"
            required
          />
        </p>
        <p>
          <label for="new_password" class="sr-only">New Password</label>
          <input
            type="password"
            id="new_password"
            v-model="form.newPassword"
            class="form-control"
            placeholder="New Password"
            required
          />
        </p>
        <p>
          <label for="new_password_confirmation" class="sr-only">New Password Confirmation</label>
          <input
            type="password"
            id="new_password_confirmation"
            v-model="form.newPasswordConfirmation"
            class="form-control"
            placeholder="New Password Confirmation"
            required
          />
        </p>
        <button type="submit" class="btn btn-lg btn-primary btn-block">Change</button>
        <router-link to="/profile" class="btn btn-warning">Cancel</router-link>
      </form>
      <button @click="handleToggleGraphql" class="btn btn-primary">Toggle GraphQL</button>
    </div>
  </template>
  
  <script>
  import { toggleGraphql } from "../utils/toggleGraphql";
  
  export default {
    data() {
      return {
        form: {
          currentPassword: "",
          newPassword: "",
          newPasswordConfirmation: "",
        },
        successMessage: "",
        errorMessage: "",
        BASE_URL: import.meta.env.VITE_BASE_URL,
      };
    },
    methods: {
      handleChangePassword() {
        const token = localStorage.getItem("authToken");
        if (!token) {
          this.$router.push("/login");
          return;
        }
  
        const data = { ...this.form };
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
  
        const isGraphQL = window.location.href.includes("graphql");
  
        if (isGraphQL) {
          fetch(`${this.BASE_URL}/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: `
                mutation changePassword($changeUserPasswordDto: ChangeUserPasswordDto!) {
                  change_password(changeUserPasswordDto: $changeUserPasswordDto)
                }
              `,
              variables: { changeUserPasswordDto: data },
            }),
          })
            .then((res) => res.json())
            .then((responseData) => {
              if (responseData.errors) {
                throw new Error(responseData.errors[0].message);
              }
              this.successMessage = "Password changed successfully!";
              localStorage.setItem("successMessage", this.successMessage);
              this.$router.push("/profile");
            })
            .catch((error) => {
              console.error("Error:", error);
              this.errorMessage =
                error.message || "An error occurred while changing the password.";
            });
        } else {
          fetch(`${this.BASE_URL}/api/users/change-password`, {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((err) => {
                  throw new Error(err.message || "Failed to change password.");
                });
              }
            })
            .then(() => {
              this.successMessage = "Password changed successfully!";
              localStorage.setItem("successMessage", this.successMessage);
              this.$router.push("/profile");
            })
            .catch((error) => {
              console.error("Error:", error);
              this.errorMessage =
                error.message || "An error occurred while changing the password.";
            });
        }
      },
      handleToggleGraphql() {
        toggleGraphql();
      },
    },
    mounted() {
      const successMessage = localStorage.getItem("successMessage");
      if (successMessage) {
        this.successMessage = successMessage;
        localStorage.removeItem("successMessage");
      }
    },
  };
  </script>
  
  <style scoped>
  .text-danger {
    color: red;
  }
  
  .text-success {
    color: green;
  }
  </style>
  