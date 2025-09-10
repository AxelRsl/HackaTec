import { createStore } from 'vuex'

export default createStore({
  state: {
    detectedSigns: [],
    currentTranslation: ''
  },
  getters: {
    getDetectedSigns: state => state.detectedSigns,
    getCurrentTranslation: state => state.currentTranslation
  },
  mutations: {
    ADD_DETECTED_SIGN(state, sign) {
      state.detectedSigns.push(sign)
      // Keep only the last 10 signs
      if (state.detectedSigns.length > 10) {
        state.detectedSigns.shift()
      }
    },
    SET_CURRENT_TRANSLATION(state, translation) {
      state.currentTranslation = translation
    }
  },
  actions: {
    addDetectedSign({ commit }, sign) {
      commit('ADD_DETECTED_SIGN', sign)
    },
    setCurrentTranslation({ commit }, translation) {
      commit('SET_CURRENT_TRANSLATION', translation)
    }
  }
})
