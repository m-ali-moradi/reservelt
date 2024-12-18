import {createRouter, createWebHistory} from "vue-router";
import RegisterPage from "../pages/RegisterPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import EditUser from "../pages/EditUser.vue";
import ChangePassword from "../pages/ChangePassword.vue";
import RestaurantSearch from "../pages/RestaurantSearch.vue";

const routes = [
    {
        path: "/register",
        name: "Register",
        component: RegisterPage,
    },
    {
        path: "/login",
        name: "Login",
        component: LoginPage,
    },
    {
        path: "/profile",
        name: "Profile",
        component: ProfilePage,
    },
    {
        path: '/edit-user',
        name: 'Edit User',
        component: EditUser
    },
    {
        path: '/change-password',
        name: 'Change Password',
        component: ChangePassword
    },
    {path: "/restaurants", name: "Restaurants", component: RestaurantSearch}
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
