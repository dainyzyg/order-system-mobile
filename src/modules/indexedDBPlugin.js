const IDB = {
  db: null,
  cb: [],
  async getDB() {
    if (this.db) {
      return this.db
    }
    await this.waitDBinit()
    return this.db
  },
  waitDBinit() {
    return new Promise((resolve, reject) => {
      this.cb.push(() => {
        resolve()
      })
    })
  },
  async getObjectStore(osName, mode) {
    let db = this.db
    if (!db) {
      db = await this.getDB()
    }
    const m = mode || 'readonly'
    const t = db.transaction(osName, m)
    return t.objectStore(osName)
  },
  async executeTransaction(storeNames, mode, cb) {
    let db = this.db
    if (!db) {
      db = await this.getDB()
    }
    const m = mode || 'readonly'
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeNames, m)
      t.onerror = e => {
        reject(e)
      }
      t.onabort = e => {
        reject(e)
      }
      t.oncomplete = e => {
        resolve(1)
      }
      cb(t)
    })
  },
  async add(osName, record) {
    const store = await this.getObjectStore(osName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(record)
      request.onerror = e => {
        reject(e)
      }
      request.onsuccess = event => {
        resolve(1)
      }
    })
  },
  async put(osName, record, key) {
    const store = await this.getObjectStore(osName, 'readwrite')
    return new Promise((resolve, reject) => {
      let request
      if (key) {
        request = store.put(record, key)
      } else {
        request = store.put(record)
      }
      request.onerror = e => {
        reject(e)
      }
      request.onsuccess = event => {
        resolve(1)
      }
    })
  },
  async get(osName, value) {
    const store = await this.getObjectStore(osName)
    return new Promise((resolve, reject) => {
      const request = store.get(value)
      request.onerror = e => {
        reject(e)
      }
      request.onsuccess = e => {
        resolve(e.target.result)
      }
    })
  },
  async executeCursor(osName, index, query, cb) {
    const datalist = []
    const store = await this.getObjectStore(osName)
    let myIndex
    if (index) {
      myIndex = store.index(index)
    } else {
      myIndex = store
    }
    return new Promise((resolve, reject) => {
      const request = myIndex.openCursor(query, 'prev')
      request.onerror = () => {
        reject('通过游标获取数据报错')
      }
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cb && cursor) {
          if (cb(cursor)) {
            datalist.push(cursor.value)
          }
        } else if (cursor) {
          datalist.push(cursor.value)
          cursor.continue()
        } else {
          resolve(datalist)
        }
      }
    })
  },
  async openIndexCursor(osName, index, query, cb) {
    const datalist = []
    const store = await this.getObjectStore(osName)
    const myIndex = store.index(index)
    return new Promise((resolve, reject) => {
      const request = myIndex.openCursor(query, 'prev')
      request.onerror = () => {
        reject('通过游标获取数据报错')
      }
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          datalist.push(cursor.value)
          cursor.continue()
        } else {
          resolve(datalist)
        }
      }
    })
  },
  async openCursor(osName) {
    const datalist = []
    const store = await this.getObjectStore(osName)
    return new Promise((resolve, reject) => {
      const request = store.openCursor(null, 'prev')
      request.onerror = () => {
        reject('通过游标获取数据报错')
      }
      request.onsuccess = event => {
        const cursor = event.target.result
        if (cursor) {
          datalist.push(cursor.value)
          cursor.continue()
        } else {
          resolve(datalist)
        }
      }
    })
  }
}
// function createStore(event, osList) {
//   const db = event.target.result
//   const t = event.target.transaction
//   for (const osName of osList) {
//     if (!db.objectStoreNames.contains(osName)) {
//       db.createObjectStore(osName, { keyPath: 'number' })
//     }
//     const os = t.objectStore(osName)
//     if (!os.indexNames.contains('subscriber')) {
//       os.createIndex('subscriber', 'subscriber', { unique: false })
//     }
//     if (!os.indexNames.contains('model')) {
//       os.createIndex('model', 'model', { unique: false })
//     }
//     if (!os.indexNames.contains('size')) {
//       os.createIndex('size', 'size', { unique: false })
//     }
//     if (!os.indexNames.contains('orderDate')) {
//       os.createIndex('orderDate', 'orderDate', { unique: false })
//     }
//     // if (!os.indexNames.contains('search2')) {
//     //   os.createIndex('search2', ['orderDate', 'subscriber', 'model', 'size'], {
//     //     unique: false
//     //   })
//     // }
//   }
// }
function createStoreAndIndex(event, osName, indexs, option) {
  const db = event.target.result
  const t = event.target.transaction
  if (!db.objectStoreNames.contains(osName)) {
    db.createObjectStore(osName, option)
  }
  const os = t.objectStore(osName)
  for (const index of indexs) {
    if (!os.indexNames.contains(index)) {
      os.createIndex(index, index, { unique: false })
    }
  }
}
function initIndexedDB(Vue) {
  Object.defineProperty(Vue.prototype, '$IDB', {
    get() {
      return IDB
    }
  })
  const openRequest = indexedDB.open('MyDatabase', 5)
  openRequest.onerror = event => {}
  openRequest.onsuccess = event => {
    IDB.db = event.target.result
    for (const c of IDB.cb) {
      c()
    }
  }
  openRequest.onupgradeneeded = event => {
    createStoreAndIndex(event, 'order', ['subscriber', 'model', 'size', 'orderDate'], { keyPath: 'number' })
    createStoreAndIndex(event, 'inventory', ['subscriber', 'model', 'size', 'arrivalDate'], { keyPath: 'number' })
    createStoreAndIndex(event, 'sales', ['purchaser', 'model', 'size', 'saleDate'], { keyPath: 'number' })
    createStoreAndIndex(event, 'pic', [], { keyPath: 'number' })
    createStoreAndIndex(event, 'dict', [])
  }
}
export default {
  install(Vue, options) {
    initIndexedDB(Vue)
  }
}
