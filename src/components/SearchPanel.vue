<template lang="pug">
  .modal(v-show="modal" @click.self="close" :style="{zIndex:zIndex}")
    transition(name='slidedown' appear @after-leave="modal=false")
      .content(v-show="contentShow")
        mt-field(v-if="roleValue!='purchaser'" label="订购人" placeholder="请输入" v-model="searchFields.subscriber")
        mt-field(v-else label="购买人" placeholder="请输入" v-model="searchFields.purchaser")
        mt-field(label="型号" placeholder="请输入" v-model="searchFields.model")
        mt-field(label="尺寸" placeholder="请输入" v-model="searchFields.size")
        .cell 
          .cell-title {{dateName}}
          .cell-item(@click="showDatePick1") {{searchFields.beginDateStr||'开始时间'}} 
          .cell-separate --
          .cell-item(@click="showDatePick2") {{searchFields.endDateStr||'结束时间'}}
        .footer
          mt-button(type="default" @click="clear") 清 空
          mt-button(type="primary" @click="search") 查 询
    mt-datetime-picker(ref="picker1" type="date" v-model="beginDate" @confirm="confirm1")
    mt-datetime-picker(ref="picker2" type="date" v-model="endDate" @confirm="confirm2")
</template>

<script>
export default {
  name: 'SearchPanel',
  props: {
    show: {
      default: true
    },
    dateName: { default: '' },
    roleValue: { default: '' }
  },
  data() {
    return {
      modal: false,
      contentShow: false,
      zIndex: 2,
      beginDate: new Date(),
      endDate: new Date(),
      searchFields: {
        beginDate: null,
        beginDateStr: '',
        endDate: null,
        endDateStr: '',
        subscriber: '',
        purchaser: '',
        model: '',
        size: null
      }
    }
  },
  methods: {
    showDatePick1() {
      this.$refs.picker1.open()
    },
    showDatePick2() {
      this.$refs.picker2.open()
    },
    confirm1(val) {
      this.searchFields.beginDate = val
      this.searchFields.beginDateStr = this.getDateStr(val)
    },
    confirm2(val) {
      this.searchFields.endDate = val
      this.searchFields.endDateStr = this.getDateStr(val)
    },
    getDateStr(val) {
      const year = val.getFullYear()
      const month = `0${val.getMonth() + 1}`.slice(-2)
      const date = `0${val.getDate()}`.slice(-2)
      return `${year}-${month}-${date}`
    },
    search() {
      this.$emit('search', this.searchFields)
    },
    clear() {
      this.searchFields = {
        beginDate: null,
        beginDateStr: '',
        endDate: null,
        endDateStr: '',
        subscriber: '',
        model: '',
        size: null
      }
    },
    close() {
      this.$emit('update:show', false)
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.zIndex = 2
        this.contentShow = true
        this.modal = true
      } else {
        this.zIndex = 1
        this.contentShow = false
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal {
  position: absolute;
  top: 30px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
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
  width: 105px;
  color: black;
}
.cell-separate {
  margin: 0 20px;
}
.selected {
  color: #0e90d2;
}
</style>
