import { NavigationGuard } from 'vue-router'

export const authMiddleware: NavigationGuard = (to, from, next) => {  
  if (localStorage.getItem('token')) {
    return next()
  } else {
    return next("/login")
  }
}
