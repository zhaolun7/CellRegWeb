<template>
  <div class="overview">
    <h1>overview</h1>
    <p>taskid: {{ getTaskId }}</p>
  </div>

</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'Overview',
  data(){
    return {
    }
  },
  computed:{
    ...mapGetters(["getTaskId","getTaskChangeFlag"])
  },
  watch: {
    getTaskChangeFlag: function(newTaskId) {
      console.log("Overview: Ha! I find taskId change! new value is ", newTaskId)
    }
  }
}
</script>