<template lang="pug">
transition(name='slidedown')
  .modal(v-show="show" @click.self="close" :style="{zIndex:zIndex}")
    input(accept="image/*" ref="picInput" style="display:none" id="picInput" type="file" @change="picChange" multiple)
    .pic
      .pic-item(@click="tapPic(i)" v-for="dataURL,i in picDataURLList" :style="{backgroundImage:`url(${dataURL})`}")
      label.pic-content(for="picInput" v-show="picDataURLList.length<3")
        i.iconfont.icon-add
      div(style="height:0;width:30vw;")
    mt-field(label="编号" placeholder="请输入" type="number" v-model.number="record.number")
    mt-field(label="订单编号" placeholder="请输入" v-model="record.orderNumber")
    mt-field(label="订单日期" placeholder="请选择" type="date"  v-model="record.orderDate")
    mt-field(label="订购人" placeholder="请输入" v-model="record.subscriber")
    SelectField(title="型号" v-model="record.model" dictName="model")
    SelectField(title="尺寸" v-model="record.size" dictName="size")
    SelectField(title="宽度" v-model="record.width" dictName="width")
    SelectField(title="款式颜色" v-model="record.color" dictName="color")
    mt-field(label="进价" placeholder="请输入" type="number" v-model.number="record.buyingPrice")
    mt-field(label="快递单号" placeholder="请输入" v-model="record.trackingNumber")
    mt-field(label="支付情况" placeholder="请输入" type="number" v-model.number="record.payment")
    mt-field(label="备注" placeholder="请输入" type="textarea" v-model="record.remark")
    .footer
      mt-button(type="default" @click="cancel") 取 消
      mt-button(type="primary" @click="save") 保 存
    mt-actionsheet(:actions="picActions" v-model="sheetVisible")
</template>

<script>
import { Toast } from 'mint-ui'
import SelectField from './SelectField'

export default {
  name: 'AddOrder',
  props: {
    show: {
      default: true
    }
  },
  components: {
    SelectField
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
      tapPicIndex: 0
    }
  },
  methods: {
    async save() {
      if (!this.record.number) {
        Toast('请输入编号！')
        return
      }
      try {
        await this.$IDB.add('inventory', this.record)
        if (this.picDataURLList.length > 0) {
          await this.$IDB.add('pic', {
            number: this.record.number,
            picDataURLList: this.picDataURLList
          })
        }
        this.$emit('update:show', false)
        this.$emit('savecomplete')
        this.record = []
        this.picDataURLList = []
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
    tapPic(i) {
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
}
.iconfont {
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
  background-color: saddlebrown;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
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
.content {
  padding-left: 10px;
  background-color: #fff;
}
.slidedown-enter-active,
.slidedown-leave-active {
  transition: all 0.2s ease-in-out;
}
.slidedown-enter,
.slidedown-leave-to {
  transform: translate3d(0, -100%, 0);
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
