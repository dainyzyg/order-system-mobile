if (window.toString() === '[object global]') {
  const path = require('path')
  const fs = require('fs')
  const Koa = require('koa')
  const Router = require('koa-router')
  const bodyParser = require('koa-bodyparser')
  const app = new Koa()
  const router = new Router()

  function startServer() {
    app.use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT')
      await next()
    })

    app.use(bodyParser({
      formLimit: '1gb',
      jsonLimit: '1gb',
      textLimit: '1gb'
    }))
    app.use(router.routes())
    router.post('/getdata', async (ctx, next) => {
      const data = await window.dd.getdata()
      ctx.body = JSON.stringify(data)
    })
    router.post('/postdata', async (ctx, next) => {
      await window.dd.postdata(JSON.parse(ctx.request.body.data))
      ctx.body = 'success'
    })
    app.use(async (ctx, next) => {
      console.log('order-system-pc')
      ctx.body = 'order-system-pc'
    })
    app.listen(8888)
  }

  function getIPAdress() {
    let address = ''
    let interfaces = require('os').networkInterfaces()
    for (var devName in interfaces) {
      var iface = interfaces[devName]
      for (var i = 0; i < iface.length; i++) {
        let alias = iface[i]
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          address = alias.address
        }
      }
    }
    return address
  }

  startServer()
  window.dd = {
    getServerIP() {
      return getIPAdress()
    },
    async importData() {
      try {
        const filepath = path.resolve(__dirname, '../../data.txt')
        const str = fs.readFileSync(filepath, 'utf8')
        const data = JSON.parse(str)
        await window.dd.postdata(data)
        return '导入成功！'
      } catch (e) {
        return '导入失败！'
      }
    },
    async exportData() {
      try {
        const data = await window.dd.getdata()
        const dataStr = JSON.stringify(data)
        const blob = new Blob([dataStr], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.download = 'data'
        a.href = url
        // 模拟a标签点击进行下载
        a.click()
        // 下载后告诉浏览器不再需要保持这个文件的引用了
        URL.revokeObjectURL(url)
        return ''
      } catch (e) {
        return '导出失败！'
      }
    }
  }
}
