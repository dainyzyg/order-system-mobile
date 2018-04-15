<template lang="pug">
  .modal(v-show="modal" @click.self="close" :style="{zIndex:zIndex}")
    transition(name='slidedown' appear @after-leave="modal=false")
      .content(v-show="contentShow")
        .cell(:class="{selected:selectedOrder=='default'}" @click="select('default')") 
          |默认排序
          i.iconfont.icon-right(v-if="selectedOrder=='default'")
        .cell(:class="{selected:selectedOrder==roleValue}" @click="select(roleValue)") 
          |{{roleName}}
          i.iconfont.icon-right(v-if="selectedOrder==roleValue")
        .cell(:class="{selected:selectedOrder=='model'}" @click="select('model')") 
          |型号
          i.iconfont.icon-right(v-if="selectedOrder=='model'")
        .cell(:class="{selected:selectedOrder=='size'}" @click="select('size')") 
          |尺寸
          i.iconfont.icon-right(v-if="selectedOrder=='size'")
</template>

<script>
export default {
  name: 'FallingModal',
  props: {
    show: {
      default: true
    },
    roleName: { default: '' },
    roleValue: { default: '' }
  },
  data() {
    return {
      modal: false,
      contentShow: false,
      zIndex: 2,
      selectedOrder: 'default'
    }
  },
  methods: {
    select(val) {
      if (val === this.selectedOrder) {
        this.close()
        return
      }
      this.selectedOrder = val
      this.$emit('orderchange', val)
      this.close()
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
.cell {
  padding-right: 10px;
  color: #666;
  height: 40px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selected {
  color: #0e90d2;
}
</style>
