<template>
    <div class="container mt-5">
      <h2 v-if="user" id="greeting">Welcome, {{ user.firstName }}!</h2>
      <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
      <div v-if="successMessage" style="color: green;">{{ successMessage }}</div>
      <div v-if="user" class="alert alert-info mt-2">
        <table>
            <tbody>
                <tr>
                <th>First Name</th>
                <td>{{ user.firstName }}</td>
                </tr>
                <tr>
                <th>Last Name</th>
                <td>{{ user.lastName }}</td>
                </tr>
                <tr>
                <th>Birth Date</th>
                <td>{{ user.birthDate }}</td>
                </tr>
                <tr>
                <th>Email</th>
                <td>{{ user.email }}</td>
                </tr>
                <tr>
                <th>Country</th>
                <td>{{ user.country.name }}</td>
                </tr>
                <tr>
                <th>City</th>
                <td>{{ user.city.name }}</td>
                </tr>
            </tbody>
        </table>
        <button @click="logout" class="btn btn-danger">Logout</button><br />
        <button @click="showDeleteModal = true" class="btn btn-primary">Delete Account</button>
        <router-link to="/edit-user" class="btn btn-warning">Edit Account</router-link>
        <router-link to="/change-password" class="btn btn-warning">Change Password</router-link>
      </div>
  
      <DeleteModal
        :showModal="showDeleteModal"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      />
    </div>
  </template>
  
  <script>
  import DeleteModal from "../components/DeleteModal.vue";

  export default {
    components: {
      DeleteModal,
    },
    data() {
      return {
        user: null,
        errorMessage: "",
        successMessage: "",
        showDeleteModal: false,
        isGraphQL: window.location.href.includes("graphql"),
        BASE_URL: import.meta.env.VITE_BASE_URL
      };
    },
    methods: {
      fetchUserProfile() {
        const token = localStorage.getItem("authToken");
        if (!token) {
          this.redirectToLogin();
          return;
        }
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        if (this.isGraphQL) {
          fetch(`${this.BASE_URL}/graphql`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: `
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
              `,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.errors) throw new Error(data.errors[0].message);
              this.user = data.data.user;
            })
            .catch(this.handleError);
        } else {
          fetch(`${this.BASE_URL}/api/users`, { headers })
            .then((res) => {
              if (!res.ok) throw new Error("HTTP error " + res.status);
              return res.json();
            })
            .then((data) => (this.user = data))
            .catch(this.handleError);
        }
      },
      handleError(err) {
        this.errorMessage = err.message || "An error occurred.";
      },
      logout() {
        localStorage.removeItem("authToken");
        localStorage.setItem("successMessage", "You have been logged out successfully!");
        this.redirectToLogin();
      },
      redirectToLogin() {
        this.$router.push("/login");
      },
      confirmDelete() {
        const token = localStorage.getItem("authToken");
        if (!token) {
          this.redirectToLogin();
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const deleteURL = this.isGraphQL
          ? `${this.BASE_URL}/graphql`
          : `${this.BASE_URL}/api/users/delete`;
        const deleteBody = this.isGraphQL
          ? JSON.stringify({ query: `mutation { delete_user }` })
          : null;

        fetch(deleteURL, {
          method: this.isGraphQL ? "POST" : "DELETE",
          headers,
          body: deleteBody,
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to delete account.");
            localStorage.removeItem("authToken");
            localStorage.setItem("successMessage", "Your account has been deleted successfully!");
            this.redirectToLogin();
          })
          .catch(this.handleError);
      },
    },
    mounted() {
      const successMessage = localStorage.getItem("successMessage");
      if (successMessage) {
        this.successMessage = successMessage;
        localStorage.removeItem("successMessage");
      }
      this.fetchUserProfile();
    },
  };

  </script>
  