<template lang="pug">
.wrapper
  .cell 
    .cell-title {{title}}
    .cell-item(@click="select" :style="{color:valueText=='请选择'?'#666':'#000'}") {{valueText}}
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
    .dd-cell-wrapper    
      .dd-cell(v-for="val in dictValues" :class="{selected:selectedValues.includes(val)}" @click="toggle(val)")
        .checkbox-core
        .checkbox-label {{val}}
        i.iconfont.icon-delete.checkbox-remove(@click.stop="remove(val)")
</template>

<script>
export default {
  name: 'SelectField',
  props: ['value', 'title', 'dictName', 'multiselect'],
  data() {
    return {
      addShow: false,
      popupVisible: false,
      dictValues: [],
      dictValuesSet: new Set(),
      selectedValues: [],
      selectedValuesSet: new Set(),
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
    toggle(val) {
      if (this.multiselect === 'false') {
        this.selectedValuesSet = new Set([val])
      } else {
        if (this.selectedValuesSet.has(val)) {
          this.selectedValuesSet.delete(val)
        } else {
          this.selectedValuesSet.add(val)
        }
      }
      this.selectedValues = [...this.selectedValuesSet]
    },
    remove(val) {
      if (this.selectedValuesSet.has(val)) {
        this.selectedValuesSet.delete(val)
        this.selectedValues = [...this.selectedValuesSet]
      }
      this.dictValuesSet.delete(val)
      this.dictValues = [...this.dictValuesSet]
      this.$IDB.put('dict', this.dictValues, this.dictName)
    },
    async getDictList() {
      const list = await this.$IDB.get('dict', this.dictName)
      if (list && list.length) {
        this.dictValues = list
        this.dictValuesSet = new Set(list)
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
      this.dictValuesSet.add(this.newValue)
      this.dictValues = [...this.dictValuesSet]
      this.$IDB.put('dict', this.dictValues, this.dictName)
      // this.popupVisible = false
      this.addShow = false
      this.newValue = ''
    },
    selectEnd() {
      if (this.selectedValues.length > 0) {
        if (this.multiselect === 'false') {
          this.$emit('input', this.selectedValues[0])
        } else {
          this.$emit('input', this.selectedValues)
        }
      }
      this.popupVisible = false
    },

    select() {
      if (!this.value || this.value.length <= 0) {
        this.selectedValuesSet = new Set()
        this.selectedValues = []
      } else if (Array.isArray(this.value)) {
        this.selectedValuesSet = new Set(this.value)
      } else {
        this.selectedValuesSet = new Set([this.value])
      }
      this.selectedValues = [...this.selectedValuesSet]
      this.popupVisible = true
    },
    cancel() {
      this.$emit('update:show', false)
    }
  },
  computed: {
    valueText() {
      if (!this.value || this.value.length <= 0) {
        return '请选择'
      } else if (Array.isArray(this.value)) {
        return this.value.join(',')
      }
      return this.value
    }
  },
  watch: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
i.iconfont.icon-delete.checkbox-remove {
  font-size: 25px;
  color: #999;
}
.checkbox-core {
  display: inline-block;
  background-color: #fff;
  border-radius: 100%;
  border: 1px solid #ccc;
  position: relative;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin: 10px;
}
.checkbox-core:after {
  border: 2px solid transparent;
  border-left: 0;
  border-top: 0;
  content: ' ';
  top: 4px;
  left: 7px;
  position: absolute;
  width: 4px;
  height: 8px;
  transform: rotate(45deg) scale(0);
  transition: transform 0.2s;
}
.selected .checkbox-core:after {
  border-color: #fff;
  transform: rotate(45deg) scale(1);
}
.selected .checkbox-core {
  background-color: #26a2ff;
  border-color: #26a2ff;
}
.checkbox-label {
  flex: 1;
  margin-left: 6px;
  font-size: 16px;
  color: #000;
}
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
.dd-cell-wrapper {
  overflow-y: auto;
  height: 192px;
  -webkit-overflow-scrolling: touch;
}
.dd-cell {
  background-image: linear-gradient(180deg, #d9d9d9, #d9d9d9 50%, transparent 50%);
  background-size: 120% 1px;
  background-repeat: no-repeat;
  background-position: bottom left;
  background-origin: content-box;
  padding-right: 10px;
  margin-left: 10px;
  color: #666;
  height: 48px;
  /* border-top: 1px solid #eee; */
  display: flex;
  justify-content: space-between;
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
