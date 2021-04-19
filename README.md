# vue应用-路由管理

文章整理自：[Vue tricks: smart router for VueJS](https://itnext.io/vue-tricks-smart-router-for-vuejs-93c287f46b50)


## 前言

因为实现的方式有很多种，这里只是分析实现原理，基于`vue-cli`实现的`vue2`和`vue3`版本可以查看原作者的[代码仓库](https://github.com/NovoManu/vue-auto-router)，我这里使用`vite+vue3+ts`的方式实现。

在日常开发中，路由的配置繁琐无趣，我们期望在写页面组件的过程中，自动生成路由配置并且导入页面组件。

自动导入路由配置的方法，需要解决如下的几个问题：

- 如何读取路由页的路径信息
- 如何处理多层路由
- 如何处理动态路由的设置
- 如何处理嵌套路由
- 路由参数meta如何处理

## 读取路由页路径信息

用 *vue-cli* 或 *vite* 生成的项目都可以实现自动读取文件夹下文件信息的功能。

vue-cli 生成的是webpack工程，可以通过 `require.context` 读取文件夹下目录：
```js
require.context('../views', true, /\.vue$/)
```

vite 也提供了读取文件夹目录信息的方法[Glob Import](https://vitejs.dev/guide/features.html#glob-import)：
```js
import.meta.glob('../views/**/*.vue')
```

通过 `meta.glob` 返回的数据类型如下：
```ts
ImportMeta.glob(pattern: string): Record<string, () => Promise<{[key: string]: any;}>>
```

因为页面路由返回的都是Promise组件，最终生成的路由配置也会是异步函数，路由配置导出如下：

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default Promise.all(routes).then((routes) => {
 return createRouter({
    history: createWebHashHistory(),
    routes,
  })
})
```

在`main.js`文件中，需要等待路由组件都加载完毕后再初始化：
```js
import { createApp } from 'vue'
import App from './App.vue'

;(async ()=>{
    const module = await import("./router");
    const router = await module.default;
    createApp(App).use(router).mount('#app')
})()
```

## 处理多层路由

下面的目录结构：

```
- src
    - views
        - users
            - Profile.vue
            - Index.vue
        Index.vue
```

生成的目录信息：
```js
const routes = {
    "../views/Index.vue": ()=>import("Index.vue"),
    "../views/user/Index.vue": ()=>import("user/Index.vue"),
    "../views/user/Profile.vue": ()=>import("user/Profile.vue"),
}
```

期望生成的路由配置：
```js
[
    {
        component: Index.vue,
        name: 'Home',
        path: '/'
    }
    {
        component: user/Index.vue,
        name: 'User',
        path: '/user'
    }
    {
        component: user/Create.vue,
        name: 'UserProfile',
        path: '/user/profile'
    }
]
```

### 实现思路

- 正则截取路径： `/^\.+\/views\/([\s\S]*?)\.vue$/` 
- 路径转小写 `toLowerCase()`
- "index" 转成 "/"

```js
const regexpPathName = /^\.+\/views\/([\s\S]*?)\.vue$/

const importAll = (routes: importType) => {
  return Object.keys(routes).map(async (key) => {
    let pathname = key.match(regexpPathName)[1].toLowerCase()

    // 需要startsWith(index) 和 endsWith(index) 判断，这里简单实现
    if (pathname.includes('index')) {
      pathname = pathname.replace('index', '')
    }

    const { default: component } = await routes[key]()

    return {
      path: '/' + pathname,
      component,
    }
  })
}

const pages: importType = import.meta.glob('../views/**/*.vue')

export default importAll(pages)
```

## 动态路由

动态路由如下：

```js
[
...
    {
        component: posts/_Id.vue,
        name: 'PostDetails',
        path: '/posts/:id'
    }
    {
        component: posts/edit/_Id.vue,
        name: 'PostEdit',
        path: '/posts/edit/:id'
    }
]
```

### 如何设置

统一规定`_` 开头的文件名为动态路由参数，如：`_Id.vue`，创建`_Id.vue`如下：

```vue
<template>
  <div>
    <h1>This is a page of the post with id {{ $route.params.id }}</h1>
  </div>
</template>

<script>
export default {
  name: "PostDetails"
}
</script>
```

### 实现思路

既然规定了命名规范，在生成路由前截取替换：
```js
if(pathname.startsWith("_")){
    pathname = pathname.replace('_', ':')
}
```

## 嵌套路由

嵌套路由配置如下：

```js
[
...
{
  component: users/Index.vue,
  name: 'Users',
  path: '/users'，
  children: [
    {
        component: users/^Profile.vue,
        name: 'UserProfile',
        path: '/users/profile'
    }
  ],
}
]
```

嵌套路由存在子属性`children`，在项目中也经常使用

### 如何设置

统一规定`^`开头的文件为子路由，例如 `^Profile.vue`。

### 如何实现

嵌套路由实现比较复杂，实现思路如下：

- 过滤`^`开头的文件，保存子路由指向父路由的唯一key值
- 加载异步组件后，判断是否有嵌套组件，存在则继续加载子路由组件

*详细代码可以参考仓库代码“router/routes.ts”*

## 路由参数meta

通过在配置路由时，会在路由配置添加meta信息，用于传递路由的额外信息：

```js
{
  component: users/Index.vue,
  name: 'Users',
  path: '/users'，
  meta: {
      title: "user",
      layout: "UserLayout",
      middleware: [requestAuth]
  }
}
```

### 实现思路

由于是自动生成的配置，meta信息可以直接添加到组件：

```js
export default {
  name: "Users",
  meta: {
    title:"用户页面",
    middlewares: [authMiddleware],
  },
  mounted(){}
  ...
};
```

在获取路由后，解构出对应的信息：

```js
 const { default: component } = await routes[key]()
 const { name, meta } = component;
 
 return {
     path,
     name,
     component,
     meta
 }
```

给路由中间件传递参数：
```js
export default Promise.all(routesPromise).then((routes) => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })
  
  // 每次路由的调用，都会先执行判断是否有路由中间件需要执行
  router.beforeEach((to, form, next) => {
    if (!to.meta.middlewares) return next();
    
    // 将参数交给路由中间件处理
    const middlewares = to.meta.middlewares || [];
    middlewares.forEach(middleware=>middleware(to, form, next));
        
  })

  return router
})
```





