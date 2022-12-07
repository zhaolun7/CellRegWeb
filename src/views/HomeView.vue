<template>
  <div id="all_page" style="min-height: 600px; min-width: 800px" >
    <el-container >
<!--      <el-header><PageHead /></el-header>-->
      <el-container>
        <el-aside width="8%" style="min-width: 130px" class="line"><PageSide/></el-aside>
        <el-main class="line"><PageMain/></el-main>
      </el-container>
    </el-container>
  </div>

</template>

<script>
// @ is an alias to /src
import PageSide from "@/components/PageSide";
import PageMain from "@/components/PageMain";
import PageHead from "@/components/PageHead";
export default {
  name: 'HomeView',
  components: {
    PageMain,
    PageSide,
    PageHead
  }
}
</script>
<style>

.line {
  border: 1px solid var(--el-border-color);
  padding: 0px;
  margin: 3px;
  height:97vh;
  box-shadow: var(--el-box-shadow-light);
}
</style>
