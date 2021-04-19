<template>
  <div>
    <h1>this is Login page</h1>
    <button type="button" @click.prevent="handleLogin">login</button>
  </div>
</template>

<script lang="ts">
  
import { useRouter } from "vue-router";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name:"Login",
  setup(){
    const router = useRouter();
    
    const handleLogin =()=>{
      localStorage.setItem("token","test");
      router.push("/users")
    }
    
    onMounted(()=>{
      localStorage.clear();
    })
    
    return {
      handleLogin
    }
  }
})
</script>

