<template>
  <div class="steps_detail">
    <h1>steps_detail</h1>
    <p>taskid: {{ $store.getters.getTaskId }}</p>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'steps_detail',
  computed:{
    ...mapGetters(["getTaskId","getTaskChangeFlag"])

  },
  watch: {
    getTaskChangeFlag: function(newTaskId) {
      console.log("steps_detail: Ha! I find taskId change! new value is ", newTaskId)
    }
  }
}
</script>