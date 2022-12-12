<template>
  <el-row class="tac">
    <el-col>
      <h3 class="mb-2">Tasks</h3>
      <el-row style="padding-left: 10%">
        <el-button type="primary" size="small">New(TODO)</el-button>
<!--        <el-button type="primary" size="small">Delete</el-button>-->
      </el-row>
      <el-menu
          :default-active="first_task_id"
          class="el-menu-vertical"
          @select="handleSelect"
      >
        <el-menu-item v-for="task in task_arr" :index="task.taskId">
          <span>{{ task.taskName }}</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>
<script>

import api from "@/api";

export default {
  name:"navigation",
  data(){
    return {
      first_task_id:"",
      task_arr: []
    }
  },
  methods:{
    handleSelect(key, keyPath) {
      let oldTaskId = this.$store.getters.getTaskId
      if(key !== oldTaskId) {
        this.$store.commit("setTaskId", key)
        api.findTaskByTaskId(key).then(res=>{
          let task = res.data._embedded.task[0];
          this.$store.commit("setTaskName", task.taskName)
          this.$store.commit("setNumberOfSession", task.numberOfSessions)
          //TODO add other variable things needed to save to vuex


          //if changing task, use `watch` to let other components know this change.
          this.$store.commit("setTaskChangeFlag")
        })
      }
    }
  },
  mounted() {
    api.findAllTasks().then(res=> {
      this.task_arr = res.data._embedded.task
      // console.log(this.task_arr)
      if(this.task_arr.length > 0) {
        this.first_task_id = this.task_arr[0].taskId
        this.handleSelect(this.first_task_id)
      }
    })
  }
}
</script>
<style scoped>
.mb-2 {
  /*background-color: grey;*/
  text-align: center;
  font-size: 30px;
  margin: 5px;
}
</style>
