import { RouteRecordRaw } from 'vue-router'

export type importType = Record<string, () => Promise<{ [key: string]: any }>>
export type returnType = Promise<RouteRecordRaw>[]


interface IRouteChild {
  [propName: string]: Array<{ path: string; importFn: any }>
}

const regexpPathName = /^\.+\/views\/([\s\S]*?)\.vue$/

const importAll = (importItem: importType): returnType => {
  const result = {} as importType
  const childResult = {} as IRouteChild
    

  // 对路径做处理
  Object.keys(importItem).forEach((key) => {
    const pathname = key.match(regexpPathName)![1].toLowerCase()
    
    // 排查 ^ 的路径名称
    if (~pathname.indexOf('^')) {
      const path = pathname
        .split('/')
        .map((path) => path.replace('^', ''))
        .join('/')
      // 父节点
      const parentKey = path.split('/')[0]
      // 子节点
      const item = {
        path,
        importFn: importItem[key],
      }
      // 保存节点
      if (childResult[parentKey]) {
        childResult[parentKey].push(item)
      } else {
        childResult[parentKey] = [item]
      }
      
    } else {
      // 格式化index和参数路径
      const path = pathname
        .split('/')
        .map((p) => {
          if (p === 'index') return null
          if (p.startsWith('_')) return p.replace('_', ':')
          return p
        })
        .filter(Boolean)
        .join('/')

      result[path] = importItem[key]
    }
  })
  
  // 加载组件，同时合并子节点到父节点
  const returnResult = Object.keys(result).map(async (path) => {
    const { default: component } = await result[path]()
    const { name, meta } = component

    const promiseResult: RouteRecordRaw = {
      path: '/' + path,
      name,
      meta,
      component,
    }

    if (childResult[path]) {
      const promises = childResult[path].map(async (childItem: any) => {
        const { default: ChildComponent } = await childItem.importFn()
        const { name: childname, meta: childMeta } = ChildComponent
        return {
          meta: childMeta,
          component: ChildComponent,
          name: childname,
          path: '/' + childItem.path,
        }
      })

      promiseResult.children = await Promise.all(promises)
    }

    return promiseResult
  })

  return returnResult
}

const pages: importType = import.meta.glob('../views/**/*.vue')

export default importAll(pages)
