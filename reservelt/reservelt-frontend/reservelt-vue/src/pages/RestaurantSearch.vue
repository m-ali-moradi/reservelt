<template>
  <div class="container">
    <h1>Search for Restaurants</h1>

    <!-- Search Form -->
    <form @submit.prevent="searchRestaurants" class="search-form">
      <div class="form-group">
        <input
            type="text"
            id="restaurantName"
            v-model="searchQuery"
            placeholder="Enter restaurant name"
        />
      </div>
      <button type="submit" class="search-button">Search</button>
    </form>

    <!-- Search Results -->
    <h1>Search Results</h1>
    <div v-if="restaurants.length === 0">
      <h5>No restaurants found.</h5>
    </div>

    <div v-else class="search-results">
      <ul>
        <li v-for="restaurant in restaurants" :key="restaurant.id">
          <h2>{{ restaurant.name }}</h2>
          <p>Phone: {{ restaurant.phoneNumber }}</p>
          <p>Address: {{ restaurant.address }}</p>
          <p>Rating: {{ restaurant.rating }}</p>
          <h3>Foods:</h3>
          <table class="table">
            <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="food in restaurant.foods" :key="food.id">
              <td>{{ food.id }}</td>
              <td>{{ food.name }}</td>
              <td>{{ food.description }}</td>
              <td>€ {{ food.price }}</td>
            </tr>
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      restaurants: [],
    };
  },
  methods: {
    async searchRestaurants() {
      try {
        const response = await fetch(`http://localhost:8080/api/restaurants/search?name=${this.searchQuery}`);
        if (response.ok) {
          this.restaurants = await response.json();
        } else {
          alert("Error fetching data");
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        alert("Error fetching restaurants.");
      }
    },
  },
};
</script>

<style scoped>
/* General body styles */
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
}

.container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
}

.search-results {
  width: max-content;
  height: auto;

}

/* Header styles */
h1 {
  text-align: center;
  color: #42b883;
  margin-bottom: 30px;
}

h3 {
  text-align: left;
}

/* Form Styles */
.search-form {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 30px;
}

.search-form .form-group {
  display: inline-block;
  margin-right: 15px;
}

.search-form input {
  width: 500px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.search-form button {
  padding: 10px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-form button:hover {
  background-color: #366f53;
}

/* Search results styles */
h2 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #fff;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

p {
  text-align: left;
}

li h2 {
  margin: 0 0 10px;
  font-size: 24px;
  color: #42b883;
}

li p {
  margin: 5px 0;
  font-size: 16px;
}

li table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

li table th,
li table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

li table th {
  background-color: #f1f1f1;
  color: #333;
}

li table tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* No results message */
.no-results {
  text-align: left;
  font-size: 18px;
  color: #888;
}

</style>
