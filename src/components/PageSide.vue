<template>
<div class="page_side">

<Navigation></Navigation>
</div>
</template>

<script>
import Navigation from "@/components/sub2/Navigation";
export default {
  name: 'PageSide',
  components: {
    Navigation
  }
}
</script>
<style scoped>
.page_side {
  width: 100%;
}
</style>