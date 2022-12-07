<template>
  <div class="schedule">
    <h1>schedule</h1>
    <p>taskid: {{ $store.getters.getTaskId }}</p>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'schedule',
  computed:{
    ...mapGetters(["getTaskId","getTaskChangeFlag"])

  },
  watch: {
    getTaskChangeFlag: function(newTaskId) {
      console.log("Schedule: Ha! I find taskId change! new value is ", newTaskId)
    }
  }
}
</script>