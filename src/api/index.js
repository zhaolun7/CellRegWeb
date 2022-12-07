// index.js
import path from "./path"
import axios from "../utils/request"

export default {
    findBySessionAndCid(session, cid){
        return axios.get(path.baseUrl + path.getCellsBySessionAndCid + '?session=' + session + '&cid=' + cid)
    },

    findBySession(session){
        return axios.get(path.baseUrl + path.getCellsBySession + '?session=' + session)
    },
    findAllTasks(){
        return axios.get(path.baseUrl + path.getAllTasks)
    },
    findTaskByTaskId(taskId){
      return axios.get(path.baseUrl+path.getTaskByTaskId +"?taskId="+taskId)
    },

}