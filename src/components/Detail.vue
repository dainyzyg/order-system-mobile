<template lang="pug">
transition(name='slidedown')
  .modal(v-show="show" @click.self="close" :style="{zIndex:zIndex}")
    .header
      i.iconfont.icon-return(@click="cancel") 
      .title {{isAdd?`添加${storeName}`:`${storeName}详情`}}
      .option 
    .content(ref="content")    
      input(accept="image/*" ref="picInput" style="display:none" id="picInput2" type="file" @change="picChange" multiple)
      .pic(ref="pic")
        img.pic-item(@click="tapPic" :data-index="i" v-for="dataURL,i in picDataURLList" :src="dataURL")
        label.pic-content(for="picInput2" v-show="picDataURLList.length<3")
          i.iconfont.icon-add
        div(style="height:0;width:30vw;")
      mt-field(label="编号" placeholder="请输入" type="number" v-model.number="record.number")
      mt-field(label="订单编号" placeholder="请输入" v-model="record.orderNumber")
      mt-field(label="订单日期" placeholder="请选择" type="date"  v-model="record.orderDate")
      mt-field(label="到货日期" placeholder="请选择" type="date"  v-model="record.arrivalDate")
      mt-field(label="销售日期" placeholder="请选择" type="date"  v-model="record.saleDate")       
      mt-field(label="订购人" placeholder="请输入" v-model="record.subscriber")
      mt-field(label="购买人" placeholder="请输入" v-model="record.purchaser")      
      ComboSelectField(title="型号" v-model="record.model" dictName="model" multiselect="false")
      ComboSelectField(title="尺寸" v-model="record.size" dictName="size" multiselect="false")
      ComboSelectField(title="宽度" v-model="record.width" dictName="width" multiselect="false")
      ComboSelectField(title="颜色" v-model="record.color" dictName="color")
      mt-field(label="进价" placeholder="请输入" type="number" v-model.number="record.buyingPrice")
      mt-field(label="售价" placeholder="请输入" type="number" v-model.number="record.salingPrice")
      mt-field(label="快递单号" placeholder="请输入" v-model="record.trackingNumber")
      mt-field(label="支付情况" placeholder="请输入" v-model.number="record.payment")
      mt-field(label="备注" placeholder="请输入" type="textarea" v-model="record.remark")
      .footer
        template(v-if="isAdd")
          mt-button(type="default" @click="cancel") 取 消
          mt-button(type="primary" @click="add") 保 存
        template(v-else)
          mt-button(type="danger" @click="remove") 删 除
          mt-button(v-if="store!='order'" type="default" @click="moveTo('order')") 转订单     
          mt-button(v-if="store!='inventory'" type="default" @click="moveTo('inventory')") 转库存
          mt-button(v-if="store!='sales'" type="default" @click="moveTo('sales')") 转销售        
          mt-button(type="primary" @click="save") 保 存        
      mt-actionsheet(:actions="picActions" v-model="sheetVisible")
</template>

<script>
import { Toast, MessageBox } from 'mint-ui'
import ComboSelectField from './ComboSelectField'

export default {
  name: 'Detail',
  props: {
    show: {
      default: true
    },
    value: {
      default: {}
    },
    store: { default: '' },
    storeName: { default: '' }
  },
  components: {
    ComboSelectField
  },
  created() {
    this.picActions = [
      {
        name: '删除',
        method: this.deleteTapPic
      }
    ]
  },
  data() {
    return {
      sheetVisible: false,
      record: {},
      picDataURLList: [],
      picActions: [],
      tapPicIndex: 0,
      isAdd: false
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.content.scrollTop = 0
        })
        if (this.value) {
          this.isAdd = false
          this.record = Object.assign({}, this.value)
          this.setPic()
        } else {
          this.record = {}
          this.picDataURLList = []
          this.isAdd = true
        }
      }
    }
  },
  methods: {
    async moveTo(targetStoreName) {
      try {
        await this.$IDB.executeTransaction(['order', 'inventory', 'sales'], 'readwrite', t => {
          const currentStore = t.objectStore(this.store)
          const targetStore = t.objectStore(targetStoreName)
          currentStore.delete(this.value.number)
          targetStore.add(this.value)
        })
        this.$emit('update:show', false)
        this.$emit('addcomplete')
        localStorage.lastModifyTime = new Date().toLocaleDateString()
      } catch (e) {
        switch (e.target.error.message) {
          case 'Key already exists in the object store.':
            Toast('编号重复无法移动！')
            break
          default:
            Toast(e.target.error.message)
            break
        }
      }
    },
    async setPic() {
      this.picDataURLList = []
      const picData = await this.$IDB.get('pic', this.value.number)
      if (picData) {
        this.picDataURLList = picData.picDataURLList
      }
    },
    async save() {
      if (!this.record.number) {
        Toast('请输入编号！')
        return
      }
      try {
        await this.$IDB.put(this.store, this.record)
        await this.$IDB.put('pic', {
          number: this.record.number,
          picDataURLList: this.picDataURLList
        })
        this.$emit('update:show', false)
        this.$emit('savecomplete', this.record)
        localStorage.lastModifyTime = new Date().toLocaleDateString()
      } catch (e) {
        switch (e.target.error.message) {
          case 'Key already exists in the object store.':
            Toast('编号已存在 请重新输入！')
            break
          default:
            Toast(e.target.error.message)
            break
        }
      }
    },
    async remove() {
      await MessageBox.confirm('确定删除?')
      await this.$IDB.executeTransaction(['order', 'inventory', 'sales', 'pic'], 'readwrite', t => {
        const currentStore = t.objectStore(this.store)
        const picStore = t.objectStore('pic')
        currentStore.delete(this.record.number)
        picStore.delete(this.record.number)
      })
      this.$emit('update:show', false)
      this.$emit('addcomplete')
      localStorage.lastModifyTime = new Date().toLocaleDateString()
    },
    async add() {
      if (!this.record.number) {
        Toast('请输入编号！')
        return
      }
      let existNumber = false
      await this.$IDB.executeTransaction(['order', 'inventory', 'sales'], 'readonly', t => {
        const orderRequest = t.objectStore('order').get(this.record.number)
        const inventoryRequest = t.objectStore('inventory').get(this.record.number)
        const salesRequest = t.objectStore('sales').get(this.record.number)
        orderRequest.onsuccess = e => {
          if (e.target.result) {
            existNumber = true
          }
        }
        inventoryRequest.onsuccess = e => {
          if (e.target.result) {
            existNumber = true
          }
        }
        salesRequest.onsuccess = e => {
          if (e.target.result) {
            existNumber = true
          }
        }
      })
      if (existNumber) {
        Toast('编号已存在 请重新输入！')
        return
      }
      try {
        await this.$IDB.add(this.store, this.record)
        if (this.picDataURLList.length > 0) {
          await this.$IDB.add('pic', {
            number: this.record.number,
            picDataURLList: this.picDataURLList
          })
        }
        this.$emit('update:show', false)
        this.$emit('addcomplete')
        this.record = {}
        this.picDataURLList = []
        localStorage.lastModifyTime = new Date().toLocaleDateString()
      } catch (e) {
        switch (e.target.error.message) {
          case 'Key already exists in the object store.':
            Toast('编号已存在 请重新输入！')
            break
          default:
            Toast(e.target.error.message)
            break
        }
      }
    },
    getPhotoSwipeItems() {
      const items = []
      const imgItems = this.$refs.pic.querySelectorAll('img')
      for (let i = 0; i < imgItems.length; i++) {
        items.push({
          src: imgItems[i].src,
          msrc: imgItems[i].src,
          w: imgItems[i].naturalWidth,
          h: imgItems[i].naturalHeight
        })
      }
      return items
    },
    getWH(src) {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = src
        image.onload = () => {
          resolve({
            src,
            msrc: src,
            w: image.width,
            h: image.height
          })
        }
      })
    },
    async getPSI() {
      let items = []
      for (const src of this.picDataURLList) {
        items.push(this.getWH(src))
      }
      items = await Promise.all(items)
      return items
    },
    async tapPic(e) {
      const index = e.target.dataset.index
      const pswpElement = document.querySelectorAll('.pswp')[0]
      const items = await this.getPSI()
      const options = {
        zoomEl: false,
        maxSpreadZoom: 1,
        index: Number(index), // start at first slide
        getThumbBoundsFn: () => {
          const rect = e.target.getBoundingClientRect()
          return {
            x: rect.left,
            y: rect.top,
            w: rect.width
          }
        }
      }
      const gallery = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options)
      gallery.init()
      const psremovediv = document.querySelector('#psremovediv')
      psremovediv.deletePic = () => {
        this.picDataURLList.splice(gallery.getCurrentIndex(), 1)
        gallery.close()
      }
      window.pswp = gallery
    },
    tapPic1(i) {
      this.tapPicIndex = i
      this.sheetVisible = true
    },
    deleteTapPic() {
      this.picDataURLList.splice(this.tapPicIndex, 1)
    },
    picChange(e) {
      const filesLength = this.$refs.picInput.files.length
      if (filesLength <= 0) {
        return
      }
      const lens = 3 - this.picDataURLList.length
      const i = filesLength >= lens ? lens : filesLength
      const fileList = []
      for (let x = 0; x < i; x++) {
        fileList.push(this.$refs.picInput.files[x])
      }
      this.readFiles(fileList)
    },
    readFiles(fileList) {
      const promises = []
      for (let i = 0; i < fileList.length; i++) {
        const promise = new Promise((resolve, reject) => {
          const fileReader = new FileReader()
          fileReader.onload = e => {
            this.imageCompression(e.target.result, fileList[i].type, dataURL => {
              resolve(dataURL)
            })
          }
          fileReader.readAsDataURL(fileList[i])
        })
        promises.push(promise)
      }
      Promise.all(promises).then(dataURLs => {
        this.picDataURLList = this.picDataURLList.concat(dataURLs)
      })
    },
    imageCompression(dataURL, type, cb) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const image = new Image()
      let scale = 1
      image.src = dataURL
      image.onload = () => {
        const px = 1000
        if (image.width > px || image.height > px) {
          if (image.width > image.height) {
            scale = 1000 / image.width
          } else {
            scale = 1000 / image.height
          }
        }
        const width = image.width * scale
        const height = image.height * scale
        window.EXIF.getData(image, () => {
          const orientation = window.EXIF.getTag(image, 'Orientation')
          switch (orientation) {
            case 2:
              canvas.width = width
              canvas.height = height
              ctx.translate(width, 0)
              ctx.scale(-1, 1)
              break
            case 3:
              canvas.width = width
              canvas.height = height
              ctx.translate(width, height)
              ctx.rotate(Math.PI)
              break
            case 4:
              canvas.width = width
              canvas.height = height
              ctx.translate(0, height)
              ctx.scale(1, -1)
              break
            case 5:
              canvas.width = height
              canvas.height = width
              ctx.rotate(0.5 * Math.PI)
              ctx.scale(1, -1)
              break
            case 6:
              canvas.width = height
              canvas.height = width
              ctx.rotate(0.5 * Math.PI)
              ctx.translate(0, -height)
              break
            case 7:
              canvas.width = height
              canvas.height = width
              ctx.rotate(0.5 * Math.PI)
              ctx.translate(width, -height)
              ctx.scale(-1, 1)
              break
            case 8:
              canvas.width = height
              canvas.height = width
              ctx.rotate(-0.5 * Math.PI)
              ctx.translate(-width, 0)
              break
            default:
              canvas.width = width
              canvas.height = height
              break
          }
          ctx.drawImage(image, 0, 0, width, height)
          const newImageData = canvas.toDataURL(type, 0.8)
          cb(newImageData)
        })
      }
    },
    cancel() {
      this.$emit('update:show', false)
    }
  },
  computed: {
    zIndex() {
      if (this.show) {
        return 10
      }
      return 1
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.header {
  /* position: absolute;
  top: 0;
  height: 30px;
  left: 0;
  right: 0; */
  flex: 0 0 30px;
  z-index: 9;
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
.content {
  flex: 1;
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.title {
  font-size: 20px;
  color: #0e90d2;
  color: #333;
}
.iconfont.icon-return {
  font-size: 26px;
  font-weight: bold;
  color: #666;
}
.option {
  color: #666;
  height: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 26px;
}
.modal {
  box-shadow: 0px 8px 6px -6px #ccc inset;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}
.iconfont.icon-add {
  font-size: 50px;
  /* font-weight: bold; */
  color: #666;
}
.pic {
  margin: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30vw;
  flex-wrap: wrap;
}
.pic-item {
  height: 30vw;
  width: 30vw;
  object-fit: cover;
}
.pic-content {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28vw;
  width: 28vw;
  border-radius: 10px;
  border: 3px dashed #ccc;
}
.slidedown-enter-active,
.slidedown-leave-active {
  transition: all 0.2s ease-in-out;
}
.slidedown-enter,
.slidedown-leave-to {
  transform: translate3d(100%, 0, 0);
}
.footer {
  background-image: linear-gradient(180deg, #d9d9d9, #d9d9d9 50%, transparent 50%);
  background-size: 120% 1px;
  background-repeat: no-repeat;
  background-position: top left;
  background-origin: content-box;
  padding-right: 10px;
  margin-left: 10px;
  color: #666;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.cell {
  background-image: linear-gradient(180deg, #d9d9d9, #d9d9d9 50%, transparent 50%);
  background-size: 120% 1px;
  background-repeat: no-repeat;
  background-position: top left;
  background-origin: content-box;
  padding-right: 10px;
  margin-left: 10px;
  color: #666;
  height: 48px;
  /* border-top: 1px solid #eee; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.cell-title {
  flex: 0 0 105px;
  color: black;
}
.cell-separate {
  margin: 0 20px;
}
.cell-item {
  flex: 1;
}
.mint-field .mint-field-core {
  background-color: #0e90d2;
}
.selected {
  color: #0e90d2;
}
</style>
