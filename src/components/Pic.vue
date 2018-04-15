<template lang="pug">
.pic(:style="{backgroundImage:backgroundImage}")
</template>

<script>
export default {
  name: 'Pic',
  props: ['number', 'updateNumber'],
  data() {
    return {
      backgroundImage: ''
    }
  },
  created() {
    console.log('created', this.number)
    this.getPic()
  },
  methods: {
    async getPic() {
      let dataURLList = []
      await this.$IDB.executeTransaction(['pic'], 'readonly', t => {
        const store = t.objectStore('pic')
        const request = store.get(this.number)
        request.onsuccess = e => {
          dataURLList = e.target.result
        }
      })

      if (dataURLList && dataURLList.picDataURLList && dataURLList.picDataURLList.length) {
        this.backgroundImage = `url(${dataURLList.picDataURLList[0]})`
      } else {
        this.backgroundImage = ''
      }
    }
  },
  watch: {
    number(val) {
      console.log('nubmber', val)
      this.getPic()
    },
    updateNumber(val) {
      if (val.number != this.number) {
        return
      }
      this.getPic()
    }
  }
}
</script>
<style scoped>
.pic {
  flex: 0 0 60px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: #ccc;
}
</style>
