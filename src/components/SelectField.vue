<template lang="pug">
.wrapper
  .cell 
    .cell-title {{title}}
    .cell-item(@click="select" :style="{color:value?'#000':'#666'}") {{value||'请选择'}}
  mt-popup.popup(v-model="popupVisible" position="bottom")
    .toolbar
      input.input-style(ref="optionInput" v-model="newValue")
      .btn-g
        .btn.cancel(@click="cancelAdd") 取消
        .btn(@click="addNew") 确定
    .toolbar2(v-show="!addShow")
      .btn(@click="popupVisible=false") 取消
      .btn(@click="add" ref="btn") 新建
      .btn(@click="selectEnd") 确定    
    mt-picker(:slots="slot" @change="onSlotChange" :visible-item-count="5")
</template>

<script>
export default {
  name: 'SelectField',
  props: ['value', 'title', 'dictName'],
  data() {
    return {
      addShow: false,
      popupVisible: false,
      tempValue: '',
      newValue: '',
      slot: [
        {
          flex: 1,
          values: [],
          defaultIndex: 0
        }
      ]
    }
  },
  created() {
    this.getDictList()
  },
  methods: {
    async getDictList() {
      const list = await this.$IDB.get('dict', this.dictName)
      if (list && list.length) {
        this.slot[0].values = list
      }
    },
    cancelAdd() {
      this.addShow = false
    },
    add() {
      this.addShow = true
      this.$refs.optionInput.focus()
    },
    addNew() {
      if (!this.newValue) return
      this.slot[0].values.push(this.newValue)
      this.$emit('input', this.newValue)
      this.$IDB.put('dict', this.slot[0].values, this.dictName)
      this.popupVisible = false
      this.addShow = false
      this.newValue = ''
    },
    selectEnd() {
      this.$emit('input', this.tempValue)
      this.popupVisible = false
    },
    onSlotChange(picker, values) {
      this.tempValue = values[0]
    },
    select() {
      const index = this.slot[0].values.indexOf(this.value)
      if (index > -1) {
        this.slot[0].defaultIndex = 0
        this.$nextTick(() => {
          this.slot[0].defaultIndex = index
        })
      }
      this.popupVisible = true
    },
    cancel() {
      this.$emit('update:show', false)
    }
  },
  watch: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.input-style {
  align-self: center;
  margin-left: 10px;
  height: 30px;
  flex: 1;
  border-radius: 5px;
  -webkit-appearance: none;
  border: 1px solid #eaeaea;
  outline: 0;
  font-size: 16px;
}
.cell {
  background-image: linear-gradient(
    180deg,
    #d9d9d9,
    #d9d9d9 50%,
    transparent 50%
  );
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
.cell-item {
  flex: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
}
.popup {
  width: 100vw;
}
.toolbar {
  height: 40px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
}
.toolbar2 {
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
}
.btn {
  height: 40px;
  width: 80px;
  font-size: 16px;
  color: #26a2ff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn-g {
  width: 110px;
  display: flex;
}
.btn.cancel {
  color: #666;
}
</style>
