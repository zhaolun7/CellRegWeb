<template>
  <!--  <div v-if="getNumberOfSessions > 0" class="session_compare" id="session_compare">-->
  <div  class="session_compare" id="session_compare">
    <!--    <h1>session_compare</h1>-->
    <!--    <p>taskid: {{ $store.getters.getTaskId }}</p>-->
    <el-row :gutter="10">
      <el-col :span="10">
        <div class="grid-content ep-bg-purple" >
          <div style="margin-bottom: 5px">
            <el-radio-group v-model="session1" size="small">
              <el-radio v-for="idx in [...Array(getNumberOfSessions).keys()]" :label="idx+1" border @change="onChange_1">{{ idx+1 }}</el-radio>
              <!-- TODO new line if number is more than 7 -->
              <!--              <br v-if="idx > 0 & idx % 3 === 0" />-->
            </el-radio-group>
          </div>
          <canvas id="canvas_1" class="big_canvas" @click.right="rightClick" ></canvas>
        </div>
      </el-col>
      <el-col :span="4" style="margin-top: 50px">
        <div class="grid-content ep-bg-purple" >
          <canvas id="canvas_comparison" class="cmp_canvas"></canvas>
          <div>
            <div>
              <p>Cell ID: {{session1_selected_cell_info.cell_id}}</p>
              <p>Neighbors: {{session1_selected_cell_info.neighbors}}</p>
            </div>

            <div>
              <p>Cell ID: {{session2_selected_cell_info.cell_id}}</p>
              <p>Neighbors: {{session2_selected_cell_info.neighbors}}</p>
            </div>
          </div>
        </div>

      </el-col>
      <el-col :span="10">
        <div class="grid-content ep-bg-purple">

          <div style="margin-bottom: 5px">
            <el-radio-group v-model="session2" size="small">
              <el-radio v-for="idx in [...Array(getNumberOfSessions).keys()]" :label="idx+1" border @change="onChange_2">{{ idx+1 }}</el-radio>
            </el-radio-group>
          </div>
          <canvas id="canvas_2" class="big_canvas" @click.right="rightClick"></canvas>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import api from "@/api";
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
// import { reactive } from "vue"
let S1 = new Object();
let S2 = new Object();
S1.name = "S1"
S2.name = "S2"
let CMP_S = new Object();
let cell_line_opacity = 0.1;

let session_cache_object = new Map(); //{"task_id":{session_id:list of cell}}
let task_and_session = ""
export default {
  name: 'session_compare',
  data() {
    return {
      session1: 1,
      session2: 2,
      session1_selected_cell_info: {
        cell_id:"-",
        neighbors: {}
      },
      session2_selected_cell_info: {
        cell_id:"-",
        neighbors: {}
      },
    }
  },
  computed: {
    ...mapGetters([
      "getTaskId",
      "getTaskChangeFlag",
      "getNumberOfSessions"
    ])
  },

  mounted() {
    this.draw_big_when_created();
    this.registerManyThings();
    // console.log("S1",CMP_S)
    task_and_session = this.getTaskId + "_" + this.session1
    // console.log("out getCellInfos:task_and_session->", task_and_session)
    if (this.getTaskId.startsWith("empty") == false) {
      this.getCellInfos();
      this.add_cells_in_one_session(S1, 0xffffff, task_and_session)
    }
    this.render();
  },
  methods: {
    registerManyThings() {
      window.addEventListener('resize', () => {
        function resizeRender(s) {
          s.renderer.setSize(s.canvas.clientWidth, s.canvas.clientHeight, false);
        }
        resizeRender(S1);
        resizeRender(S2);
        resizeRender(CMP_S);
      })
      document.addEventListener('pointermove', (event) => {
        // console.log(event)
        function _check_move(s) {
          // console.log(s)
          let rect = s.canvas.getBoundingClientRect();
          if (event.clientX >= rect.left && event.clientX <= rect.right &&
              event.clientY >= rect.top && event.clientY <= rect.bottom) {
            s.pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
            s.pointer.y = -(event.clientY - rect.top) / rect.height * 2 + 1;
          }
        }
        _check_move(S1);
        _check_move(S2);
      });


      document.addEventListener( 'click', (event) => {
        // console.log(event)
        function check_click(s) {
          let rect = s.canvas.getBoundingClientRect();
          if (event.clientX >= rect.left && event.clientX <= rect.right &&
              event.clientY >= rect.top && event.clientY <= rect.bottom) {
            const intersects = s.raycaster.intersectObjects( s.cell_group.children, false );
            // console.log(intersects)
            if (intersects.length > 0 && intersects[0].object.type == 'Line') {
              let lineObject = intersects[0].object
              lineObject.selected_nochange = ! lineObject.selected_nochange;
              if (lineObject.selected_nochange) {
                lineObject.currentHex_b = lineObject.currentHex;
                // lineObject.material.transparent = false;
              } else {
                lineObject.currentHex = lineObject.currentHex_b;
                lineObject.material.color.setHex( lineObject.currentHex );
                lineObject.material.opacity = cell_line_opacity;
                // lineObject.material.transparent = true;
              }
            }
          }
        }
        check_click(S1);
        check_click(S2);
      });

      // //onRightClick
      // document.addEventListener( 'contextmenu',);
    },
    rightClick(event) {
        this.check_click(S1);
        this.check_click(S2);
      },
    draw_comparing_cell(cell, group) {
      // draw border
      let xx = 99999; let yy = 99999;
      for(let p of cell.points) {
        // console.log(p)
        if(xx > p[0]) {
          xx = p[0];
        }
        if(yy > p[1]) {
          yy = p[1];
        }
      }
      let points = [];
      for(let p of cell.points) {
        points.push(new THREE.Vector3(p[1] - yy,p[0] - xx, 0));
      }
      // console.log(points)
      let geometry = new THREE.BufferGeometry().setFromPoints(points);
      let material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: cell_line_opacity*2,
        // opacity: 1,
        side: THREE.DoubleSide,
        depthTest: false
      });
      let line = new THREE.Line(geometry, material);
      line.renderOrder = 10;
      // line.cell = cell; // made a link
      while(group.children.length > 0) {
        group.children.pop();
      }
      group.add(line);

      //draw plane
      const WIDTH = 30;
      const HEIGHT = 30;
      const imgBuffer = new Float32Array(HEIGHT*WIDTH*4).fill(0)
      //init
      for(let i = 0; i< HEIGHT; i ++) {
        for(let j = 0; j < WIDTH; j++) {
          let pos = (i*WIDTH +j) * 4;
          imgBuffer[pos+3] = 255; // alpha channel
        }
      }
      let maxPercent = 0;
      for(let block of cell.blocks) {
        let percent = block[2];
        if(maxPercent < percent) {
          maxPercent = percent;
        }
      }
      for(let blockIdx in cell.blocks) {
        let block = cell.blocks[blockIdx];
        let pos = (WIDTH*(block[0] - xx) + (block[1] - yy))*4;
        let v = block[2] / maxPercent * 150 + 55;
        if(v > 255){
          v = 255;
        }
        // v = 255;
        imgBuffer[pos] = v;
        imgBuffer[pos+1] = v;
        imgBuffer[pos+2] = v;
      }
      const imgRealBuffer = Uint8Array.from(imgBuffer);
      let alphaTexture = new THREE.DataTexture(imgRealBuffer, WIDTH, HEIGHT, THREE.RGBAFormat);
      alphaTexture.needsUpdate = true;
      alphaTexture.wrapS = THREE.RepeatWrapping;
      alphaTexture.wrapT = THREE.RepeatWrapping;
      alphaTexture.repeat.set( 1, 1 );

      var planeGeometry = new THREE.PlaneGeometry(HEIGHT, WIDTH);
      var planeMeterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: true});
      planeMeterial.alphaMap = alphaTexture;
      var planeMesh = new THREE.Mesh(planeGeometry,planeMeterial);
      planeMesh.position.set(14,14,0)
      // console.log(planeMesh);
      group.add(planeMesh);
    },
    check_click(s) {
      let rect = s.canvas.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        const intersects = s.raycaster.intersectObjects( s.cell_group.children, false );
        // console.log(intersects)
        if (intersects.length > 0 && intersects[0].object.type == 'Line') {
          let lineObject = intersects[0].object
          lineObject.selected_nochange = ! lineObject.selected_nochange;
          if (lineObject.selected_nochange) {
            lineObject.currentHex_b = lineObject.currentHex;
            let task_and_session = lineObject.userData["task_and_session"];
            let idx = parseInt(lineObject.userData["idx"]);
            let cell = session_cache_object.get(task_and_session)[idx];
            // console.log(cell)
            if(cell) {
              this.draw_comparing_cell(cell, s.cmp_group)
              if(s.name === "S1") {
                this.session1_selected_cell_info.cell_id = cell.cid;
                this.session1_selected_cell_info.neighbors = cell.relation[this.session2]
              } else  {
                this.session2_selected_cell_info.cell_id = cell.cid;
                this.session2_selected_cell_info.neighbors = cell.relation[this.session1]
              }
            }


          } else {
            lineObject.currentHex = lineObject.currentHex_b;
            lineObject.material.color.setHex( lineObject.currentHex );
            lineObject.material.opacity = cell_line_opacity;
            // lineObject.material.transparent = true;
          }
        }
      }
    },
    onChange_1(v) {
      task_and_session = this.getTaskId + "_" + this.session1
      this.getCellInfos();
      this.add_cells_in_one_session(S1, 0xffffff, task_and_session)
    },
    onChange_2(v) {
      task_and_session = this.getTaskId + "_" + this.session2
      this.getCellInfos();
      this.add_cells_in_one_session(S2, 0xffffff, task_and_session)
    },
    add_cells_in_one_session(s, color, task_and_session) {
      // console.log("add_cells_in_one_session:task_and_session->", task_and_session)
      let cellsArr = session_cache_object.get(task_and_session)
      // console.log("session_cache_object->",session_cache_object)
      // console.log("cellsArr->",cellsArr)
      if (cellsArr === undefined) {
        return;
      }
      s.cell_group.clear();
      const WIDTH = 350;
      const HEIGHT = 350;
      const imgBuffer = new Float32Array(HEIGHT * WIDTH * 4).fill(0)
      //init
      for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
          let pos = (i * WIDTH + j) * 4;
          imgBuffer[pos + 3] = 255; // alpha channel
        }
      }
      for (let idx in cellsArr) {
        let points = cellsArr[idx].points;
        let blocks = cellsArr[idx].blocks;
        // console.log(cellsArr[idx])

        let relation = cellsArr[idx].relation;
        let opposite_relationjson;
        if (s.name === "S1") {
          opposite_relationjson = relation[""+this.session2]
        } else {
          opposite_relationjson = relation[""+this.session1]
        }
        let flagMatched = false;
        if(opposite_relationjson) {
          let keys = Object.keys(opposite_relationjson)
          for(let key of keys) {
            if(opposite_relationjson[key].algorithmSelected) {
              flagMatched = true;
              break;
            }
          }
        }
        this.draw_single_cell(s.cell_group, points, blocks, color, imgBuffer, WIDTH, task_and_session, idx, flagMatched);
      }


      const imgRealBuffer = Uint8Array.from(imgBuffer);
      let alphaTexture = new THREE.DataTexture(imgRealBuffer, WIDTH, HEIGHT, THREE.RGBAFormat);
      alphaTexture.needsUpdate = true;
      alphaTexture.wrapS = THREE.ClampToEdgeWrapping;
      alphaTexture.wrapT = THREE.ClampToEdgeWrapping;
      alphaTexture.repeat.set(1, 1);
      // console.log("s.hasPlaneMesh:", s.hasPlaneMesh)
      if (s.hasPlaneMesh === false) {
        let planeGeometry = new THREE.PlaneGeometry(HEIGHT, WIDTH, 1, 1);
        let planeMeterial = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide, transparent: true});
        planeMeterial.alphaMap = alphaTexture;
        let planeMesh = new THREE.Mesh(planeGeometry, planeMeterial);
        planeMesh.position.set(0, 50, 0)
        s.planeMesh = planeMesh;
        s.hasPlaneMesh = true;
        s.scene.add(planeMesh);
      } else {
        // console.log(s.planeMesh)
        s.planeMesh.material.alphaMap = alphaTexture;
      }

    },
    getCellInfos() {
      // console.log("in getCellInfos:task_and_session->", task_and_session)
      if (session_cache_object.has(task_and_session) === false) {
        api.findBySession(task_and_session).then(res => {
          let result_cell = res.data._embedded.cell;
          // console.log("task_and_session:", result_cell[0].session)
          session_cache_object.set(result_cell[0].session, result_cell);
        })
      } else {
        // console.log("we have!", task_and_session)
      }

    },
    draw_big_when_created() {
      this.init_session(S1, 'canvas_1');
      this.init_session(S2, 'canvas_2');
      this.init_session(CMP_S, 'canvas_comparison');

      function syncChange(controls_A, controls_B) {
        controls_A.addEventListener('change', function(){
          controls_B.target.copy(controls_A.target);
          controls_B.object.position.copy(controls_A.object.position)
          controls_B.object.zoom = controls_A.object.zoom;
          controls_B.object.quaternion.copy(controls_A.object.quaternion)
          // console.log("A -> B");
        })
        controls_B.addEventListener('change', function(){
          controls_A.target.copy(controls_B.target);
          controls_A.object.position.copy(controls_B.object.position)
          controls_A.object.zoom = controls_B.object.zoom;
          controls_A.object.quaternion.copy(controls_B.object.quaternion)
          // console.log("B -> A");
        })
      }
      syncChange(S1.controls, S2.controls)
      S1.cmp_group = CMP_S.cell_group_1;
      S2.cmp_group = CMP_S.cell_group_2;

      // const x1 = CMP_S.cell_group_1.position.x;
      // const x2 = CMP_S.cell_group_2.position.x;
      // CMP_S.cell_group_1.position.x = x1 ;// TODO: auto change distance!
      // CMP_S.cell_group_2.position.x = x2 ;

      S1.hasPlaneMesh = false;
      S2.hasPlaneMesh = false;
    },
    init_session(s, name) {
      // s.name = name;

      s.scene = new THREE.Scene();
      s.scene.background = new THREE.Color(0x000000);
      let z_deep = 220;
      let distance = 8;
      if (name === "canvas_comparison") {
        s.cell_group_1 = new THREE.Group();
        s.cell_group_1.position.set(-distance - 10, -5, 0);
        s.scene.add(s.cell_group_1);

        s.cell_group_2 = new THREE.Group();
        s.cell_group_2.position.set(distance, -5, 0);
        s.scene.add(s.cell_group_2);

        z_deep = 30;
      } else {

        s.cell_group = new THREE.Group();
        s.cell_group.position.set(0, 0, 0);

        s.pointer = new THREE.Vector2();
        s.pointer.x = -1;
        s.pointer.y = -1;

        s.raycaster = new THREE.Raycaster();
        s.INTERSECTED = null;
        s.scene.add(s.cell_group);
      }

      s.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      s.camera.aspect = 1;
      s.camera.position.set(0, 0, z_deep);
      // console.log(z_deep)
      s.camera.updateProjectionMatrix();
      s.canvas = document.querySelector('#' + name);
      s.canvas.parent_object = s;
      // console.log(name)
      s.renderer = new THREE.WebGL1Renderer({canvas: s.canvas});
      s.renderer.setSize(s.canvas.clientWidth, s.canvas.clientHeight, false);
      // s.renderer.setPixelRatio(s.canvas.clientWidth/s.canvas.clientHeight);
      s.renderer.setPixelRatio(1);
      s.controls = new OrbitControls(s.camera, s.renderer.domElement);
      s.controls.enableRotate = false;

      // add axes help
      // const axesHelper = new THREE.AxesHelper(50);
      // s.scene.add(axesHelper) ;
    },

    render(time) {
      // console.log(time)
      function renderSession(s) {
        // TODO: 同步镜像
        // console.log(typeof s.camera.position)
        // console.log("####",s)
        s.controls.update();
        s.camera.updateProjectionMatrix();
        if (s.raycaster) {
          s.raycaster.setFromCamera(s.pointer, s.camera);
          const intersects = s.raycaster.intersectObjects(s.cell_group.children, false);
          if (intersects.length > 0) {
            if (s.INTERSECTED != intersects[0].object && intersects[0].object.type == 'Line') {
              if (s.INTERSECTED && !s.INTERSECTED.selected_nochange) {
                s.INTERSECTED.material.color.setHex(s.INTERSECTED.currentHex);
                s.INTERSECTED.material.opacity = cell_line_opacity;
                // s.INTERSECTED.material.transparent = true;
              }
              s.INTERSECTED = intersects[0].object;
              s.INTERSECTED.currentHex = s.INTERSECTED.material.color.getHex()
              s.INTERSECTED.material.color.setHex(0xff0000);
              s.INTERSECTED.material.opacity = 1;
              // s.INTERSECTED.material.transparent = false;
            }
          } else {
            if (s.INTERSECTED && !s.INTERSECTED.selected_nochange) {
              s.INTERSECTED.material.color.set(s.INTERSECTED.currentHex);
              s.INTERSECTED.material.opacity = cell_line_opacity;
              // INTERSECTED.material.transparent = true;
            }
            s.INTERSECTED = null;
          }
        }
        s.renderer.render(s.scene, s.camera);
      }



      renderSession(S1);
      renderSession(S2);
      renderSession(CMP_S)

      // S2.camera.updateProjectionMatrix();

      requestAnimationFrame(this.render);
    },
    draw_single_cell(cell_group, points, blocks, colorHex, imgBuffer, WIDTH, task_and_session, idx, flagMatched) {
      for (let data of blocks) {
        let pos = (WIDTH * data[0] + data[1]) * 4;
        imgBuffer[pos] = imgBuffer[pos] * 0.5 + data[2] * 2560;
        if (imgBuffer[pos] > 255) {
          imgBuffer[pos] = 255;
        }
        imgBuffer[pos + 1] = imgBuffer[pos];
        imgBuffer[pos + 2] = imgBuffer[pos];
      }
      let lineColorHex = colorHex;
      let single_cell_line_opacity = cell_line_opacity;
      if(flagMatched) {
        // lineColorHex = 0x1ffe01;
        lineColorHex = 0xffffff;
      } else {
        // not matched: yellow ?
        lineColorHex = 0xeaca67
        single_cell_line_opacity = 1;
        // lineColorHex = 0xff0000
      }

      let material = new THREE.LineDashedMaterial({
        color: lineColorHex,
        transparent: true,
        opacity: single_cell_line_opacity,
        side: THREE.DoubleSide,
        depthTest: false
      });
      let points_t3 = Array(points.length);
      for (let idx2 in points) {
        let x = points[idx2][0];
        let y = points[idx2][1];
        points_t3[idx2] = (new THREE.Vector3(y - 174, x - 124, 0)); // T' because display of threejs is different from matlab matrix display ?
      }

      let geometry = new THREE.BufferGeometry().setFromPoints(points_t3);
      let line = new THREE.Line(geometry, material);
      line.renderOrder = 10;
      line.userData["task_and_session"] = task_and_session;
      line.userData["idx"] = idx;
      // line.cell = cell; // made a link
      cell_group.add(line);

    }
  },
  watch: {
    getTaskChangeFlag: function (order) {
      // console.log("SessionCompare: Ha! I find taskId change! new value is ", order)
      session_cache_object.clear()
      for (let idx of [...Array(this.getNumberOfSessions).keys()]) {
        let tas = this.getTaskId + "_" + (idx + 1)
        // console.log("tas:",tas)
        if (session_cache_object.has(tas) === false) {
          api.findBySession(tas).then(res => {
            let result_cell = res.data._embedded.cell;
            // console.log("task_and_session:", result_cell[0].session)
            session_cache_object.set(result_cell[0].session, result_cell);
            if(result_cell[0].session === this.getTaskId + "_" + this.session1) {
              // console.log("we got" + this.getTaskId + "_" + this.session1)
              this.add_cells_in_one_session(S1, 0xffffff, result_cell[0].session)
            }
            if(result_cell[0].session === this.getTaskId + "_" + this.session2) {
              // console.log("we got" + this.getTaskId + "_" + this.session2)
              this.add_cells_in_one_session(S2, 0xffffff, result_cell[0].session)
            }
          })
        }
      }
    }
  }
}
</script>
<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;

}
.cmp_canvas {
  width: 100%;
  aspect-ratio : 1 / 1;
  background-color: black;
  border-radius: 10px;
}
.big_canvas {
  width: 100%;
  aspect-ratio : 1 / 1;
  background-color: black;
  border-radius: 10px;
}

* {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
}
</style>