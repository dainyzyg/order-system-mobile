<template lang="pug">
.page
  .header
    i.iconfont.icon-return.between(@click="$router.push('/menu')") 
    .title 设置
    .between
  .ippicker
    .ippicker-title 服务器IP地址:
    mt-picker(:slots="slots" @change="onSlotChange" :visible-item-count=1)
  .ippicker
    .ippicker-title 最后修改时间: {{lastModifyTime}}
  .content
    .menu-icon(@click="upload")
      .upload
      .title2 上传至电脑
    .menu-icon
      .download(@click="download")
      .title2 从电脑下载
  //- router-view
  
</template>

<script>
import { Toast, Indicator } from 'mint-ui'
import axios from 'axios'

// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
// axios.defaults.maxContentLength = 100

export default {
  name: 'setting',
  data() {
    return {
      slots: [],
      ip: localStorage.ip || '192.168.1.101',
      lastModifyTime: localStorage.lastModifyTime
    }
  },
  created() {
    this.initSlots()
  },
  watch: {},
  methods: {
    async checkConnect() {
      try {
        const response = await axios({
          method: 'get',
          url: `http://${this.ip}:8888`,
          timeout: 2000
        })
        return response.data === 'order-system-pc'
      } catch (e) {
        return false
      }
    },
    async upload() {
      try {
        Indicator.open({
          text: '上传中...',
          spinnerType: 'double-bounce'
        })
        if (!await this.checkConnect()) {
          Toast('无法连接到服务器！')
          this.$nextTick(() => {
            Indicator.close()
          })
          return
        }
        localStorage.ip = this.ip
        console.log('a')
        const dataStr = JSON.stringify(await this.getdata())
        axios({
          method: 'post',
          url: `http://${this.ip}:8888/postdata`,
          data: {
            data: dataStr
          }
        })
          .then(response => {
            this.$nextTick(() => {
              Indicator.close()
            })
            if (response.data == 'success') {
              Toast('上传成功！')
            } else {
              Toast('上传失败！')
            }
          })
          .catch(error => {
            console.dir(error)
            const em = error.message || '连接服务器失败！'
            Toast(em)
            this.$nextTick(() => {
              Indicator.close()
            })
          })
      } catch (e) {
        this.$nextTick(() => {
          Indicator.close()
        })
        Toast(e.message)
      }
    },
    async download() {
      Indicator.open({
        text: '下载中...',
        spinnerType: 'double-bounce'
      })
      if (!await this.checkConnect()) {
        Toast('无法连接到服务器！')
        this.$nextTick(() => {
          Indicator.close()
        })
        return
      }
      localStorage.ip = this.ip
      axios({
        method: 'post',
        url: `http://${this.ip}:8888/getdata`
      })
        .then(async response => {
          await this.setData(response.data)
          this.$nextTick(() => {
            Indicator.close()
          })
          Toast('更新成功！')
          localStorage.lastModifyTime = new Date().toLocaleDateString()
        })
        .catch(error => {
          console.log(error)
          const em = error.message || '连接服务器失败！'
          Toast(em)
          this.$nextTick(() => {
            Indicator.close()
          })
        })
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
    onSlotChange(picker, values) {
      this.ip = values.join('.')
    },
    initSlots() {
      const valuse = []
      for (let i = 0; i <= 255; i++) {
        valuse.push(i)
      }
      const defaultIndexs = this.ip.split('.')
      for (let i = 0; i < 4; i++) {
        const slot = {
          flex: 1,
          values: valuse,
          textAlign: 'right'
        }
        slot.defaultIndex = Number(defaultIndexs[i])
        this.slots.push(slot)
      }
    }
  }
}
</script>

<style scoped>
.between {
  flex: 0 0 50px;
}
.title {
  font-size: 20px;
  color: #333;
}
.title2 {
  font-size: 16px;
  color: #666;
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
  height: 80px;
  /* background-color: #0e90d2; */
  width: 100vw;
}
.ippicker-title {
  margin: 10px;
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
</style>
