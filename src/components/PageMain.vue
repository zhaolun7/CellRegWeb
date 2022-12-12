<template>
<div v-loading="loading" class="page_main">
  <el-scrollbar>
  <el-tabs type="border-card" tabPosition="top" v-model="activeName" class="switch-tabs" @tab-click="handleClick">
    <el-tab-pane :label="getTaskName" name="first">
      <Overview></Overview></el-tab-pane>
    <el-tab-pane label="Compare" name="second">
      <SessionCompare v-on:addNumberOfLoadedSessions="addNumberOfLoadedSessions"></SessionCompare></el-tab-pane>
    <el-tab-pane label="Steps" name="third">
      <StepsDetail></StepsDetail></el-tab-pane>
    <el-tab-pane label="Schedule" name="fourth">
      <Schedule></Schedule></el-tab-pane>
  </el-tabs>
  </el-scrollbar>
</div>
</template>

<script>
import { ref } from 'vue'
import Overview from "@/components/sub1/Overview";
import Schedule from "@/components/sub1/Schedule";
import StepsDetail from "@/components/sub1/StepsDetail";
import SessionCompare from "@/components/sub1/SessionCompare";
import {mapGetters} from "vuex";
export default {
  name:"PageMain",
  components: {
    Schedule,
    SessionCompare,
    StepsDetail,
    Overview
  },
  data(){
    return {
      activeName:ref("second"),
      numberOfLoadedSessions: 0,
      loading: false
    }
  },
  computed:{
    ...mapGetters(["getTaskId","getTaskChangeFlag","getTaskName","getNumberOfSessions"])
  },
  methods:{
    handleClick(tab, event){
      console.log(this.activeName)
    },
    addNumberOfLoadedSessions(a) {
      this.numberOfLoadedSessions ++;
      // console.log("addNumberOfLoadedSessions:",this.numberOfLoadedSessions)
      if(this.numberOfLoadedSessions === this.getNumberOfSessions) {
        this.loading = false;
      }
    }
  },
  watch: {
    getTaskChangeFlag: function(newTaskId) {
      this.numberOfLoadedSessions = 0;
      this.loading = true;
      console.log("PageMain: Ha! I find taskId change! new value is ", newTaskId)
    }
  },
}
</script>

<style scoped>
.switch-tabs {
  height:194vh;
  /*background-color: lightgray;*/
}
.page_main {
  height:100%;
}
</style>