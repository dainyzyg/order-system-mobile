<template lang="pug">
.page
  .card(v-for="i in 10")
    .card-header
      mt-badge(size="small") 00{{i}}
      .order-number BK110LL100
      .date 2018.11.12
    .card-body
      .pic
      .info
        .info-cell
          span 型号：
          . 
            JOBMASTER
        .info-cell 
          span 尺寸宽度：
          mt-badge.badge(size="small" color="#bbb") 105
          mt-badge.badge(size="small" color="#bbb") EE
        .info-cell
          span 订购人：
          .
            许多多
    .card-footer 11寸/100H
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      pickerValue: null
    }
  },
  methods: {
    handleButtonClick() {
      this.$refs.picker.open()
    }
  }
}
</script>

<style scoped>
.page {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: rgb(244, 244, 244);
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
  background-size: 100%;
  background-position: center;
  background-image: url(../assets/timg2.jpg);
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
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
  flex: 1;
  color: #666;
}
.info-cell span {
  color: #0e90d2;
}
.info-cell .badge {
  color: white;
  margin-left: 5px;
}
</style>
