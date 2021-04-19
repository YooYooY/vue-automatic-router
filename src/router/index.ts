import { createRouter, createWebHashHistory, RouteMeta } from 'vue-router'
import routesPromise from './routes'

type autoicalRouteMeta = RouteMeta &
  Partial<{
    middlewares: Function[]
    layout: string
  }>


export default Promise.all(routesPromise).then((routes) => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  router.beforeEach((to, form, next) => {
    if (!to.meta.middlewares) return next();

    const middlewares = (to.meta as autoicalRouteMeta).middlewares || [];
    
    middlewares.forEach(middleware=>{
      middleware(to, form, next)
    });
        
  })

  return router
})
