<template>
  <nav>
    <router-link to="/">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
    <router-link to="/posts">Go to Post</router-link>
    <router-link to="/login">login</router-link>
    <router-link to="/posts/create">Go to Post create</router-link>
    <router-link to="/posts/1">Go to Post 1</router-link>
    <router-link to="/posts/edit/123">Go to edit detail</router-link>
    <router-link to="/users">Users</router-link>
    <router-link to="/users/profile">User Profile</router-link>
    <router-link to="/users/other">User Other</router-link>
  </nav>
  <main>
    <router-view></router-view>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {},
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
nav{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
nav a{
  padding: 5px 10px;
}
</style>
