<template lang="pug">
.page
  .header
    i.iconfont.icon-return(@click="$router.push('/menu')") 
    .title 
      |库存
      span.count {{`(${count}条)`}}
    .option       
      .group(@click="showSort")
        |排序
        i.iconfont.icon-unfold
      i.iconfont.icon-search(@click="showSearch")
      i.iconfont.icon-addition(@click="showAdd")
  .content
    .empty(v-show="recordList.length==0") 
      i.iconfont.icon-empty
      |暂无数据
    .card-content(ref="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="100")
      .card(v-for="item,i in datalist" :key="item.number" @click="showDetail(item,i)")
        .card-header
          mt-badge(size="small") {{getNumber(item.number)}}
          .order-number {{item.orderNumber}}
          .date {{!item.arrivalDate?'':`到货日期: ${item.arrivalDate}`}}
        .card-body
          Pic(:number="item.number" :updateNumber="updateNumber")
          .info
            .info-main
              .info-cell
                span 型号：
                . 
                  {{item.model}}
              .info-cell 
                span 尺寸宽度：
                mt-badge.badge(size="small" color="#bbb") {{item.size}}
                mt-badge.badge(size="small" color="#bbb") {{item.width}}
              .info-cell
                span 订购人：
                .
                  {{item.subscriber}}
            .info-right 
              .info-payment {{!item.payment?'未支付':item.payment}}
              .info-beizhu {{item.remark}}
  FallingModal(roleName="订购人" roleValue="subscriber" :show.sync="popupVisible" @orderchange="orderchange")
  SearchPanel(dateName="到货日期" roleValue="subscriber" :show.sync="searchPanelVisible" @search="search")
  Detail(store="inventory" storeName="库存" :show.sync="detailVisible" :value.sync="currentRecord" @addcomplete="initData" @savecomplete="modifyRecord")
</template>

<script>
import FallingModal from '@/components/FallingModal'
import SearchPanel from '@/components/SearchPanel'
import Detail from '@/components/Detail'
import Pic from '@/components/Pic'

export default {
  name: 'Inventory',
  components: {
    FallingModal,
    SearchPanel,
    Detail,
    Pic
  },
  data() {
    return {
      detailVisible: false,
      popupVisible: false,
      searchPanelVisible: false,
      addVisible: false,
      datalist: [],
      recordList: [],
      recordIndex: 0,
      dataURL: '',
      currentRecord: {},
      currentIndex: null,
      updateNumber: '',
      loading: false
    }
  },
  created() {
    this.initData()
  },
  mounted() {
    // this.initData()
  },
  computed: {
    count() {
      return this.recordList.length
    }
  },
  methods: {
    getNumber(val) {
      const str = String(val)
      if (str.length < 3) {
        const i = 3 - str.length
        const padLeft = Array(i + 1).join('0')
        return `${padLeft}${str}`
      }
      return val
    },
    loadMore() {
      if (this.recordIndex == 0) {
        return
      }
      if (this.recordIndex > this.recordList.length) {
        return
      }
      this.loading = true
      for (let i = this.recordIndex; i <= this.recordIndex + 10; i++) {
        if (i < this.recordList.length) {
          this.datalist.push(this.recordList[i])
        }
      }
      this.recordIndex += 11
      this.loading = false
    },
    modifyRecord(record) {
      this.datalist[this.currentIndex] = record
      this.updateNumber = { number: record.number }
    },
    showDetail(record, i) {
      this.currentRecord = record
      this.currentIndex = i
      this.detailVisible = true
    },
    async search(val) {
      let keyRangeValue = null
      if (val.beginDateStr && val.endDateStr) {
        keyRangeValue = IDBKeyRange.bound(val.beginDateStr, val.endDateStr)
      } else if (val.beginDateStr) {
        keyRangeValue = IDBKeyRange.lowerBound(val.beginDateStr)
      } else if (val.endDateStr) {
        keyRangeValue = IDBKeyRange.upperBound(val.endDateStr)
      }
      let datalist
      if (keyRangeValue) {
        datalist = await this.$IDB.executeCursor('inventory', 'arrivalDate', keyRangeValue, cursor => {
          cursor.continue()
          const subscriberReg = new RegExp(val.subscriber, 'i')
          const modelReg = new RegExp(val.model, 'i')
          const subscriberTest = !val.subscriber || subscriberReg.test(cursor.value.subscriber)
          const modelTest = !val.model || modelReg.test(cursor.value.model)
          const sizeTest = !val.size || String(cursor.value.size) == String(val.size)

          return subscriberTest && modelTest && sizeTest
        })
      } else {
        datalist = await this.$IDB.executeCursor('inventory', null, null, cursor => {
          cursor.continue()
          const subscriberReg = new RegExp(val.subscriber, 'i')
          const modelReg = new RegExp(val.model, 'i')
          const subscriberTest = !val.subscriber || subscriberReg.test(cursor.value.subscriber)
          const modelTest = !val.model || modelReg.test(cursor.value.model)
          const sizeTest = !val.size || String(cursor.value.size) == String(val.size)

          return subscriberTest && modelTest && sizeTest
        })
      }
      this.searchPanelVisible = false
      this.recordList = datalist
      this.datalist = []
      for (let i = 0; i <= 10; i++) {
        if (i < this.recordList.length) {
          this.datalist.push(this.recordList[i])
        }
      }
      this.recordIndex = 11
    },
    async orderchange(index) {
      this.$refs.content.scrollTop = 0
      if (index === 'default') {
        this.initData()
      } else {
        this.recordList = await this.$IDB.openIndexCursor('inventory', index)
        this.datalist = []
        for (let i = 0; i <= 10; i++) {
          if (i < this.recordList.length) {
            this.datalist.push(this.recordList[i])
          }
        }
        this.recordIndex = 11
      }
    },
    async initData() {
      this.recordList = await this.$IDB.openCursor('inventory')
      this.datalist = []
      for (let i = 0; i <= 10; i++) {
        if (i < this.recordList.length) {
          this.datalist.push(this.recordList[i])
        }
      }
      this.recordIndex = 11
    },
    showAdd() {
      this.currentRecord = null
      this.currentIndex = null
      this.detailVisible = true

      this.searchPanelVisible = false
      this.popupVisible = false
      // this.addVisible = !this.addVisible
    },
    async showSort() {
      this.searchPanelVisible = false
      this.addVisible = false
      this.popupVisible = !this.popupVisible
    },
    showSearch() {
      this.popupVisible = false
      this.addVisible = false
      this.searchPanelVisible = !this.searchPanelVisible
    },
    handleButtonClick() {
      this.$refs.picker.open()
    }
  }
}
</script>

<style scoped>
.count {
  padding-left: 5px;
  font-size: 16px;
  color: #666;
}
i.iconfont.icon-empty {
  font-weight: normal;
  font-size: 60px;
  color: #999;
}
.empty {
  font-size: 16px;
  height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}
.card-content {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
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
  overflow: hidden;
}
.title {
  font-size: 20px;
  color: #0e90d2;
  color: #333;
}
.iconfont {
  font-size: 26px;
  font-weight: bold;
  color: #666;
}
.icon-unfold {
  font-size: 20px;
}
.option {
  color: #666;
  height: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 150px;
}
.group {
  color: #666;
  height: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  line-height: 30px;
}
.page {
  position: absolute;
  top: 0;
  bottom: 0px;
  left: 0px;
  right: 0px;
  display: flex;
  background-color: #eaeaea;
  display: flex;
  flex-direction: column;
}
.card {
  font-size: 14px;
  margin: 5px 10px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  background: #fff;
}
.card-header {
  height: 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
}
.card-body {
  height: 60px;
  display: flex;
  padding: 5px;
  position: relative;
}
.card-footer {
  height: 30px;
  border-top: 1px solid #eee;
  color: #888;
  display: flex;
  align-items: center;
  padding: 0 5px;
}
.order-number {
  color: #0e90d2;
}
.date {
  color: #888;
}
.pic {
  flex: 0 0 60px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: #ccc;
}
.pic1 {
  flex: 0 0 60px;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: center;
  background-image: url(../assets/timg.jpg);
}
.info {
  display: flex;
  flex: 1;
  color: #666;
}
.info-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
}
.info-right {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  flex: 0 0 100px;
  overflow: hidden;
}
.info-payment {
  flex: 1;
  align-self: flex-end;
  color: #ef4f4f;
}
.info-beizhu {
  flex: 2;
  color: #888;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-wrap: break-word;
  width: 100px;
}
.info-cell span {
  color: #0e90d2;
}
.info-cell .badge {
  color: white;
  margin-left: 5px;
}
.icon-accessory {
  color: #0e90d2;
  font-size: 50px;
}
</style>
