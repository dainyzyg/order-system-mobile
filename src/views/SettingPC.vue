<template lang="pug">
.page
  input(accept="text/plain" ref="fileInput" id="pcfileinput" style="display:none" type="file" @change="fileChange")
  .header
    i.iconfont.icon-return.between(@click="$router.push('/menu')") 
    .title 设置
    .between
  .ippicker
    .ippicker-title 
      |服务器IP地址:
      span.ip {{ip}}
  .ippicker
    .ippicker-title
      |最后修改时间:
      span.ip {{lastModifyTime}}
  .content
    .menu-icon(@click="exportData")
      .upload
      .title2 导出文件
    label.menu-icon(for="pcfileinput")
      .download
      .title2 从文件导入
</template>

<script>
import { Toast, Indicator } from 'mint-ui'

export default {
  name: 'setting',
  data() {
    return {
      ip: window.dd.getServerIP(),
      lastModifyTime: localStorage.lastModifyTime
    }
  },
  created() {
    window.dd.getdata = this.getdata
    window.dd.postdata = this.setData
  },
  watch: {},
  methods: {
    fileChange() {
      try {
        const filesLength = this.$refs.fileInput.files.length
        if (filesLength != 1) {
          return
        }
        const fileReader = new FileReader()
        fileReader.onload = async e => {
          try {
            const data = JSON.parse(e.target.result)
            await this.setData(data)
            this.$nextTick(() => {
              Indicator.close()
            })
            Toast('导入成功！')
            localStorage.lastModifyTime = new Date().toLocaleDateString()
          } catch (ex) {
            this.$nextTick(() => {
              Indicator.close()
            })
            Toast(ex)
          }
        }
        fileReader.readAsText(this.$refs.fileInput.files[0])

        Indicator.open({
          text: '处理中...',
          spinnerType: 'double-bounce'
        })
      } catch (ex) {
        this.$nextTick(() => {
          Indicator.close()
        })
        Toast(ex)
      }
    },
    readFiles(fileList) {
      const promises = []
      for (let i = 0; i < fileList.length; i++) {
        const promise = new Promise((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = e => {
            resolve(e.target.result)
          }
          fileReader.readAsDataURL(fileList[i])
        })
        promises.push(promise)
      }
      Promise.all(promises).then(dataURLs => {
        this.picDataURLList = this.picDataURLList.concat(dataURLs)
      })
    },
    async exportData() {
      Indicator.open({
        text: '处理中...',
        spinnerType: 'double-bounce'
      })
      const msg = await window.dd.exportData()
      this.$nextTick(() => {
        Indicator.close()
      })
      if (msg) {
        Toast(msg)
      }
    },
    async importData() {
      Indicator.open({
        text: '处理中...',
        spinnerType: 'double-bounce'
      })
      const msg = await window.dd.importData()
      this.$nextTick(() => {
        Indicator.close()
      })
      if (msg) {
        Toast(msg)
      }
    },
    async setData(data) {
      await this.$IDB.executeTransaction(Object.keys(data), 'readwrite', t => {
        Object.keys(data).forEach(key => {
          t.objectStore(key).clear()
          Object.keys(data[key]).forEach(pkey => {
            // console.log(key, data[key][pkey], pkey)
            if (key == 'dict') {
              t.objectStore(key).add(data[key][pkey], pkey)
            } else {
              t.objectStore(key).add(data[key][pkey])
            }
          })
        })
      })
      localStorage.lastModifyTime = new Date().toLocaleDateString()
      console.log('set success')
    },
    async getStore(storeName) {
      const storeObject = {}
      await this.$IDB.executeTransaction([storeName], 'readonly', t => {
        const store = t.objectStore(storeName)
        const request = store.openCursor()
        request.onsuccess = event => {
          const cursor = event.target.result
          if (cursor) {
            storeObject[cursor.key] = cursor.value
            cursor.continue()
          }
        }
      })
      return storeObject
    },
    async getdata() {
      const getStore = this.getStore
      const [order, inventory, sales, pic, dict] = await Promise.all([
        getStore('order'),
        getStore('inventory'),
        getStore('sales'),
        getStore('pic'),
        getStore('dict')
      ])
      return { order, inventory, sales, pic, dict }
    }
  }
}
</script>

<style scoped>
.title {
  font-size: 20px;
  color: #333;
}

.iconfont {
  font-size: 26px;
  font-weight: bold;
  color: #666;
}
.header {
  /* position: absolute;
  top: 0;
  height: 30px;
  left: 0;
  right: 0; */
  height: 30px;
  border-bottom-width: 1px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 6px #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  font-size: 14px;
}

.page {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  /* background-color: #eee; */
  overflow: hidden;
}
.ippicker {
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #0e90d2; */
  width: 100vw;
  color: #666;
}
.ip {
  padding-left: 10px;
  color: #0e90d2;
}
.content {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.menu-icon {
  width: 30vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.upload {
  width: 70px;
  height: 70px;
  background-size: cover;
  background-image: url(../assets/upload.svg);
  margin-bottom: 10px;
}
.download {
  width: 70px;
  height: 70px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url(../assets/download.svg);
  margin-bottom: 10px;
}
</style>
