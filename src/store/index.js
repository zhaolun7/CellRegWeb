import { createStore } from 'vuex'

export default createStore({
  state: {
    taskId: "empty",
    taskName:"(please select)",
    numberOfSessions:0,
    taskChangeFlag:0,
    cell_line_opacity: 0.1
  },
  getters: {
    getTaskId(state) {
      return state.taskId
    },
    getTaskName(state) {
      return state.taskName
    },
    getNumberOfSessions(state) {
      return state.numberOfSessions
    },
    getTaskChangeFlag(state) {
      return state.taskChangeFlag
    }
  },
  mutations: {
    setTaskId(state, newTaskId) {
      state.taskId = newTaskId;
    },
    setTaskName(state, newName){
      state.taskName = newName;
    },
    setNumberOfSession(state, newNum){
      state.numberOfSessions = newNum;
    },
    setTaskChangeFlag(state) {
      state.taskChangeFlag ++;
    },
  },
  actions: {
  },
  modules: {
  }
})
