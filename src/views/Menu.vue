<template lang="pug">
.page
  .menu-icon(@click="$router.push('order')")
    i.iconfont.icon-order
    .title 订 单
  .menu-icon(@click="$router.push('inventory')")
    i.iconfont.icon-shop_fill
    .title 库 存
  .menu-icon(@click="$router.push('sales')")
    i.iconfont.icon-service
    .title 销 售
  .menu-icon(@click="$router.push('setting')")
    i.iconfont.icon-setup
    .title 设 置
  //- router-view
  
</template>

<script>
export default {
  name: 'main-menu',
  data() {
    return {
      selected: this.$router.currentRoute.path
    }
  },
  watch: {},
  methods: {}
}
</script>

<style scoped>
.page {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  /* background-color: #eee; */
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
}
.menu-icon {
  width: 40vw;
  height: 40vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.title {
  color: #666;
}
.menu-icon:nth-child(1) {
  border-right: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
}
.menu-icon:nth-child(2) {
  border-bottom: 1px dashed #ccc;
}
.menu-icon:nth-child(3) {
  border-right: 1px dashed #ccc;
}
.iconfont {
  font-size: 25vw;
  /* font-weight: bold; */
  color: #666;
}
</style>
