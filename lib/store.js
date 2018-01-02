'use babel'

import { createStore, combineReducers } from 'redux'

const assign = (...items) => Object.assign({}, ...items)

function updateArrayItem (array, index, o) {
  if (index === -1) {
    return array
  }
  return array.slice(0, index).concat(
    assign(array[index], o),
    array.slice(index + 1)
  )
}
function removeArrayItem (array, index) {
  return index === -1 ? array : array.slice(0, index).concat(array.slice(index + 1))
}

function state (state = 'notStarted', action) {
  switch (action.type) {
    case 'STOP':
      return 'notStarted'

    case 'RESTART':
      return 'waiting'

    case 'SET_STATE':
      return action.state
  }
  return state
}

function goget(state = null, action) {
  switch (action.type) {
    case 'SET_GOGET':
      return  action.goget;
    case 'UNSET_GOGET':
      return null
  }
  return state
}

function goconfig(state = null, action) {
  switch (action.type) {
    case 'SET_GOCONFIG':
      return action.goconfig;
    case 'UNSET_GOCONFIG':
      return null
  }
  return state
}

function content (state = [], action) {
  switch (action.type) {
    case 'CLEAR_OUTPUT_CONTENT':
      return []

    case 'ADD_OUTPUT_CONTENT':
      return state.concat(action.content)
  }
  return state
}

const services = combineReducers({
  goget,
  goconfig
})

const output = combineReducers({
  content
})

const build = combineReducers({
  state
})

export default function (state) {
  if (state && state.panel) {
    delete state.panel
  }

  const store = createStore(combineReducers({
    build,
    output,
    services
  }), state)

  // init the store (upgrades the previous state so it is usable again)
  store.dispatch({ type: 'INIT_STORE' })

  return store
}
