<template>
  <div>
    <h1>This is an users page</h1>
    <router-view />
  </div>
</template>

<script lang="ts">
import {authMiddleware} from '../../middlewares/auth'

export default {
  name: "Users",
  meta: {
    middlewares: [authMiddleware],
  },
};
</script>
