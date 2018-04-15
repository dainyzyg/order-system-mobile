<template lang="pug">
transition(:name='transitionName')
  router-view
</template>

<script>
export default {
  name: 'app',
  created() {},
  data() {
    return {
      transitionName: 'slide-left',
      nIntervId: null
    }
  },
  methods: {},
  watch: {
    // $route(to, from) {
    //   console.log(to, from)
    //   if (to.path === '/menu') {
    //     this.transitionName = 'slide-right'
    //   } else {
    //     this.transitionName = 'slide-left'
    //   }
    //   // const toDepth = to.path.split('/').length
    //   // const fromDepth = from.path.split('/').length
    //   // this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    // }
  }
}
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease-in-out;
}
.slide-left-enter,
.slide-left-leave-to {
  transform: translate3d(100%, 0, 0);
}
.slide-right-enter,
.slide-right-leave-to {
  transform: translate3d(-100%, 0, 0);
}
</style>
