<template>
  <!--  <div v-if="getNumberOfSessions > 0" class="session_compare" id="session_compare">-->
  <div class="session_compare" id="session_compare">
    <el-row :gutter="10">
      <el-col :span="10">
        <div class="grid-content ep-bg-purple" >
          <div style="margin-bottom: 5px">
            <el-radio-group v-model="session1" size="small">
              <el-radio v-for="idx in [...Array(getNumberOfSessions).keys()]" :label="idx+1" border @change="onSelectButtonChange">{{ idx+1 }}</el-radio>
              <!-- TODO new line if number is more than 7 -->
              <!--              <br v-if="idx > 0 & idx % 3 === 0" />-->
            </el-radio-group>
          </div>
          <canvas id="canvas_1" class="big_canvas" @click="clickCanvas" ></canvas>
          <div v-if="session1_selected_cell_info.cell_id!=='-'">
            <p >Session:{{session1}} Cel ID:{{session1_selected_cell_info.cell_id}}</p>
            <el-table :data="session1_selected_cell_info.neighbors"
                      border
                      stripe
                      :span-method="arraySpanMethod_1"
                      style="width: 100%; margin-top: 20px"

            >
              <el-table-column label="Neighbors" width="100%" align="center">
                <el-table-column prop="session" label="Session" />
                <el-table-column prop="cid" label="cell id" />
                <el-table-column prop="distance" label="Distance" />
                <el-table-column prop="pSameDistance" label="P_same" />
                <el-table-column prop="spatialCorrelation" label="Spatial Correlation" />
                <el-table-column prop="pSameSpatialCorrelation" label="P_same" />
                <el-table-column prop="algorithmSelected" label="selected" />
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
      <el-col :span="4" style="margin-top: 50px">
        <div class="grid-content ep-bg-purple" >
          <div>
            <span>Synchronous Marking: </span>
            <el-switch
                v-model="sync_mark"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="Y"
                inactive-text="N"
            />
            <div>
              <p>Cell ID: {{session1_selected_cell_info.cell_id}}</p>
            </div>
            <div>
              <p>Cell ID: {{session2_selected_cell_info.cell_id}}</p>
            </div>
            <div>
              <span>unpaired color: </span><el-color-picker v-model="color_of_unpaired" />
            </div>
            <div>
              <span>paired color: </span><el-color-picker v-model="color_of_paired" />
            </div>
            <canvas id="canvas_comparison" class="cmp_canvas"></canvas>
          </div>
        </div>

      </el-col>
      <el-col :span="10">
        <div class="grid-content ep-bg-purple">

          <div style="margin-bottom: 5px">
            <el-radio-group v-model="session2" size="small">
              <el-radio v-for="idx in [...Array(getNumberOfSessions).keys()]" :label="idx+1" border @change="onSelectButtonChange">{{ idx+1 }}</el-radio>
            </el-radio-group>
          </div>
          <canvas id="canvas_2" class="big_canvas" @click="clickCanvas"></canvas>
<!--          <div v-if="session2_selected_cell_info.neighbors.cell_id != '-'">-->
          <div v-if="session2_selected_cell_info.cell_id!=='-'">
            <p>Session:{{session2}} Cel ID:{{session2_selected_cell_info.cell_id}}</p>
            <el-table :data="session2_selected_cell_info.neighbors"
                      border
                      :span-method="arraySpanMethod_2"
                      style="width: 100%; margin-top: 20px"
            >
              <el-table-column label="Neighbors" width="100%" align="center">
                <el-table-column prop="session" label="Session" />
                <el-table-column prop="cid" label="cell id" />
                <el-table-column prop="distance" label="Distance" />
                <el-table-column prop="pSameDistance" label="P_same" />
                <el-table-column prop="spatialCorrelation" label="Spatial Correlation" />
                <el-table-column prop="pSameSpatialCorrelation" label="P_same" />
                <el-table-column prop="algorithmSelected" label="selected" />
              </el-table-column>
            </el-table>
          </div>
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
export default {
  name: 'session_compare',
  data() {
    return {
      sync_mark: true,
      session1: 1,
      session2: 2,
      session1_selected_cell_info: {
        cell_id:"-",
        neighbors: []
      },
      session2_selected_cell_info: {
        cell_id:"-",
        neighbors: []
      },
      color_of_paired: "#00ff00",
      color_of_unpaired: "#ff0000",
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
    S1.this_obj = this
    S2.this_obj = this
    this.draw_big_when_created();
    this.registerManyThings();
    this.render();
  },
  methods: {
    get_color_of_unpaired(){
      return "0x"+this.color_of_unpaired.substring(1);
    },
    get_color_of_paired(){
      return "0x"+this.color_of_paired.substring(1);
    },
    arraySpanMethod_1({ row, column, rowIndex, columnIndex }) {
      const arr = this.getSpan(this.session1_selected_cell_info.neighbors);
      if (columnIndex < 1) {
        const row = arr[rowIndex].row;
        const col = arr[rowIndex].col;
        return {
          rowspan: row,
          colspan: col
        };
      }
    },
    arraySpanMethod_2({ row, column, rowIndex, columnIndex }) {
      const arr = this.getSpan(this.session2_selected_cell_info.neighbors);
      if (columnIndex < 1) {
        const row = arr[rowIndex].row;
        const col = arr[rowIndex].col;
        return {
          rowspan: row,
          colspan: col
        };
      }
    },
    getSpan(list) {
      const newArr = [];
      const obj = {};
      for (let i = 0; i < list.length; i++) {
        if (i === 0) {
          obj.row = 1;
          obj.col = 1;
          newArr.push(obj);
        } else {
          if (list[i].session === list[i - 1].session) {
            newArr.push({ row: 0, col: 0 });
            const index = list.findIndex(item => {
              return item.session === list[i - 1].session;
            });
            newArr[index].row++;
          } else {
            newArr.push({ row: 1, col: 1 });
          }
        }
      }
      // console.log(newArr)
      return newArr;
    },
    relation2array(relation){
      let resultArray = new Array();
      let sessions = Object.keys(relation)
      for(let session of sessions) {
        let single_relation = relation[session];
        let cids = Object.keys(single_relation);
        for(let cid of cids) {
          // deep copy
          let mp = JSON.parse(JSON.stringify(single_relation[cid]))
          mp["session"] = session;
          mp["cid"] = cid;

          mp["distance"] = (mp["distance"]).toFixed(5);
          mp["pSameDistance"] = (mp["pSameDistance"]*100).toFixed(3) + '%';
          mp["spatialCorrelation"] = (mp["spatialCorrelation"]*100).toFixed(3) + '%';
          mp["pSameSpatialCorrelation"] = (mp["pSameSpatialCorrelation"]*100).toFixed(3) + '%';

          resultArray.push(mp)
        }
      }
      return resultArray;
    },
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
        function _check_move(s,opposite_s) {
          // console.log(s)
          let rect = s.canvas.getBoundingClientRect();
          if (event.clientX >= rect.left && event.clientX <= rect.right &&
              event.clientY >= rect.top && event.clientY <= rect.bottom) {
            s.pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
            s.pointer.y = -(event.clientY - rect.top) / rect.height * 2 + 1;
            // To prevent mouse moving fast
            opposite_s.pointer.x = undefined;
            opposite_s.pointer.y = undefined;
          }
        }
        _check_move(S1, S2);
        _check_move(S2, S1);
      });
    },
    clickCanvas(event) {
        this.check_click(S1, event, S2);
        this.check_click(S2, event, S1);
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
    check_click(s, event, opposite_s) {
      function _process_click_single_canvas(s, lineObject, deepFlag) {
        let oppositeMatchedLineObject = null;
        let task_and_session = lineObject.userData["task_and_session"];
        let idx = parseInt(lineObject.userData["idx"]);
        let cell = session_cache_object.get(task_and_session)[idx];
        if(cell) {
          if(deepFlag) {
            oppositeMatchedLineObject = s.this_obj.getOppositeMatchedLineObject(s, cell.relation);
          }
          s.this_obj.draw_comparing_cell(cell, s.cmp_group)
          if(s.name === "S1") {
            // S1
            s.this_obj.session1_selected_cell_info.cell_id = cell.cid;
            s.this_obj.session1_selected_cell_info.neighbors = s.this_obj.relation2array(cell.relation)
          } else {
            // S2
            s.this_obj.session2_selected_cell_info.cell_id = cell.cid;
            s.this_obj.session2_selected_cell_info.neighbors = s.this_obj.relation2array(cell.relation)
          }
        }
        if(s.SELECTED_LINE) {
          // unset last selected cell
          s.SELECTED_LINE.material.color.setHex( s.SELECTED_LINE.userData.color );
          s.SELECTED_LINE.material.opacity = s.SELECTED_LINE.userData.opacity;
          if(s.SELECTED_LINE != lineObject) {
            s.SELECTED_LINE = lineObject;
          } else {
            //if they are same,
            s.SELECTED_LINE = null;
          }
        } else {
          s.SELECTED_LINE = lineObject;
        }
        return oppositeMatchedLineObject;
      }
      let rect = s.canvas.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        const intersects = s.raycaster.intersectObjects( s.cell_group.children, false );
        if (intersects.length > 0 && intersects[0].object.type == 'Line') {
          let oppositeMatchedLineObject = _process_click_single_canvas(s, intersects[0].object, this.sync_mark)
          if(this.sync_mark && oppositeMatchedLineObject) {
            _process_click_single_canvas(opposite_s, oppositeMatchedLineObject, false)
          }
        }
      }
    },
    onSelectButtonChange(v) {
      this.add_cells_in_one_session(S1, 0xffffff, this.getTaskId + "_" + this.session1)
      this.add_cells_in_one_session(S2, 0xffffff, this.getTaskId + "_" + this.session2)
    },
    isFlagMatched(s, relation) {
      let opposite_relationjson;
      if (s.name === "S1") {
        opposite_relationjson = relation[""+this.session2]
      } else {
        opposite_relationjson = relation[""+this.session1]
      }
      let flagMatched = false;
      if(this.session2 == this.session1) {
        flagMatched = true
      }else if(opposite_relationjson) {
        let keys = Object.keys(opposite_relationjson)
        for(let key of keys) {
          if(opposite_relationjson[key].algorithmSelected) {
            flagMatched = true;
            break;
          }
        }
      }
      return flagMatched;
    },
    getOppositeMatchedLineObject(s, relation) {
      let opposite_relationjson;
      let opposite_session ;
      if (s.name === "S1") {
        opposite_relationjson = relation[""+this.session2]
        opposite_session = this.getTaskId + "_" + +this.session2;
      } else {
        opposite_relationjson = relation[""+this.session1]
        opposite_session = this.getTaskId + "_" + +this.session1;
      }

      if(this.session2 == this.session1) {
        return s.INTERSECTED
      }else if(opposite_relationjson) {
        let keys = Object.keys(opposite_relationjson)
        for(let key of keys) {
          if(opposite_relationjson[key].algorithmSelected) {
            return session_cache_object.get(opposite_session)[parseInt(key)-1].lineObject
          }
        }
      }
      return null;
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
        let cell = cellsArr[idx];
        let flagMatched = this.isFlagMatched(s, cellsArr[idx].relation)
        this.draw_single_cell(s.cell_group, cell, color, imgBuffer, WIDTH, task_and_session, idx, flagMatched);
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


      s.init_target = new THREE.Vector3();
      s.init_target.copy(s.controls.target);
      s.init_object_position = new THREE.Vector3();
      s.init_object_position.copy(s.controls.object.position);
      s.init_object_zoom = s.controls.object.zoom;
      s.init_object_quaternion = new THREE.Quaternion()
      s.init_object_quaternion.copy(s.controls.object.quaternion);
    },

    render(time) {
      function renderSession(s, opposite_s) {
        function unsetINTERSECTED(s) {
          if (s.INTERSECTED && s.INTERSECTED !== s.SELECTED_LINE) {
            // console.log(s.name)
            if(s.INTERSECTED.userData.isInitiative) {
              s.INTERSECTED.material.color.setHex(s.INTERSECTED.userData.color);
              s.INTERSECTED.material.opacity = s.INTERSECTED.userData.opacity;
              s.INTERSECTED.userData.isInitiative = false;
              // console.log(s.INTERSECTED)
              s.INTERSECTED = null;
            }
          }
        }
        function setINTERSECTED(s, lineObject, deepFlag) {
          let oppositeMatchedLineObj = null;
          s.INTERSECTED = lineObject;
          s.INTERSECTED.userData["isInitiative"] = true;

          let color = s.this_obj.get_color_of_unpaired()
          let session = session_cache_object.get(s.INTERSECTED.userData["task_and_session"])
          if(session) {
            let cell = session[s.INTERSECTED.userData["idx"]] ;
            if(s.this_obj.isFlagMatched(s, cell.relation)) {
              color = s.this_obj.get_color_of_paired()
              if(deepFlag) {
                oppositeMatchedLineObj = s.this_obj.getOppositeMatchedLineObject(s, cell.relation);
              }
            }
          }
          s.INTERSECTED.material.color.setHex(color);
          s.INTERSECTED.material.opacity = 1;
          return oppositeMatchedLineObj;
        }

        s.controls.update();
        s.camera.updateProjectionMatrix();
        if (s.raycaster) {
          s.raycaster.setFromCamera(s.pointer, s.camera);
          const intersects = s.raycaster.intersectObjects(s.cell_group.children, false);
          if (intersects.length > 0) {
            if (s.INTERSECTED !== intersects[0].object && intersects[0].object.type == 'Line') {
              // // force clean
              // console.log( " force clean ->", s.name)
              // console.log( "s.INTERSECTED:", s.INTERSECTED)
              // console.log("intersects[0].object:",intersects[0].object)
              unsetINTERSECTED(s);
              unsetINTERSECTED(opposite_s);
            }
            let oppositeMatchedLineObj = setINTERSECTED(s,intersects[0].object, opposite_s, s.this_obj.sync_mark)
            if(s.this_obj.sync_mark && oppositeMatchedLineObj) {
              setINTERSECTED(opposite_s,oppositeMatchedLineObj, null, false)
            }
          } else {
            //option clean..
            if(!(s.pointer.x === undefined && s.pointer.y === undefined)) {
              // active canvas
              // console.log("option clean:",s.name)
              unsetINTERSECTED(s);
              unsetINTERSECTED(opposite_s);
            }

          }
        }
        s.renderer.render(s.scene, s.camera);
      }



      renderSession(S1, S2);
      renderSession(S2, S1);
      renderSession(CMP_S, null)

      // S2.camera.updateProjectionMatrix();

      requestAnimationFrame(this.render);
    },
    draw_single_cell(cell_group, cell, colorHex, imgBuffer, WIDTH, task_and_session, idx, flagMatched) {
      for (let data of cell.blocks) {
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
      let points_t3 = Array(cell.points.length);
      for (let idx2 in cell.points) {
        let x = cell.points[idx2][0];
        let y = cell.points[idx2][1];
        points_t3[idx2] = (new THREE.Vector3(y - 174, x - 124, 0)); // T' because display of threejs is different from matlab matrix display ?
      }

      let geometry = new THREE.BufferGeometry().setFromPoints(points_t3);
      let line = new THREE.Line(geometry, material);
      line.renderOrder = 10;
      line.userData["task_and_session"] = task_and_session;
      line.userData["idx"] = idx;
      // for recover
      line.userData["color"] = lineColorHex;
      line.userData["opacity"] = single_cell_line_opacity;
      // line.cell = cell;// do not match too many properties;
      cell.lineObject = line;
      cell_group.add(line);

    }
  },
  watch: {
    getTaskChangeFlag: function (order) {
      //init
      function initSwitch(s) {
        s.camera.position.set(0, 0, 220);
        s.controls.target.copy(s.init_target);
        s.controls.object.position.copy(s.init_object_position);
        s.controls.object.zoom = s.init_object_zoom;
        s.controls.object.quaternion.copy(s.init_object_quaternion);
        s.camera.updateProjectionMatrix();
      }
      if(order > 1) {
        initSwitch(S1);
        initSwitch(S2);
        // initSwitch(CMP_S);
      }
      this.session1_selected_cell_info =  {
        cell_id:"-",
        neighbors: []
      }
      this.session2_selected_cell_info =  {
        cell_id:"-",
        neighbors: []
      }

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
              this.add_cells_in_one_session(S1, 0xffffff, result_cell[0].session)
            }else if(result_cell[0].session === this.getTaskId + "_" + this.session2) {
              this.add_cells_in_one_session(S2, 0xffffff, result_cell[0].session)
            }
            this.$emit("addNumberOfLoadedSessions","")
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