import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import PouchDB from 'pouchdb-browser'

import tools from '../tools/index.js'

Vue.use(Vuex)

const session = {
  namespaced: true,
  state: {
    doc: {
      _id: 'ikiliptus',
      name: 'default',
      color: '#1976D2',
      remote: ''
    },
    $db: new PouchDB('ikiliptus'),
    $sync: null,
    $remote: null,
    customFields: {
      _id: 'custom_fields',
      fields: []
    },
    activities: [],
    cachedSortedActivities: {
      refresh: true,
      value: []
    }
  },
  mutations: {
    setCustomFields (state, payload) {
      Vue.set(state, 'customFields', payload.doc)
    },
    setActivity (state, payload) {
      if (payload.doc._id !== undefined) {
        if (payload.doc.categories === undefined) {
          Vue.set(payload.doc, 'categories', [])
        }

        let found = false
        for (let i = 0; i < state.activities.length; i++) {
          if (state.activities[i]._id && state.activities[i]._id === payload.doc._id) {
            Vue.set(state.activities, i, payload.doc)
            found = true
            break
          }
        }

        if (!found) {
          state.activities.push(payload.doc)
        }

        Vue.set(state.cachedSortedActivities, 'refresh', true)
      }
    },
    removeActivity (state, payload) {
      for (let i = 0; i < state.activities.length; i++) {
        if (state.activities[i]._id && state.activities[i]._id === payload.doc._id) {
          state.activities.splice(i, 1)
          Vue.set(state.cachedSortedActivities, 'refresh', true)
          break
        }
      }
    }
  },
  getters: {
    activitiesByID (state, getters) {
      let result = {}

      state.activities.forEach(activity => {
        if (activity._id && activity._id.trim() !== '') {
          Vue.set(result, activity._id, activity)
        }
      })

      return result
    },
    activitiesSortedByTime (state, getters) {
      if (!state.cachedSortedActivities.refresh) {
        return state.cachedSortedActivities.value
      }

      Vue.set(state.cachedSortedActivities, 'value', state.activities
        .sort((a, b) => {
          let bTime = moment(b.start_date + ' ' + b.start_hour + ':' + b.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()
          let aTime = moment(a.start_date + ' ' + a.start_hour + ':' + a.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()

          return bTime - aTime
        })
      )
      Vue.set(state.cachedSortedActivities, 'refresh', false)
      return state.cachedSortedActivities.value
    },
    finishedActivities (state, getters) {
      return getters.activitiesSortedByTime
        .filter(e => e.stop_date !== undefined && e.stop_hour !== undefined && e._id !== undefined)
    },
    runningActivities (state, getters) {
      return getters.activitiesSortedByTime
        .filter(e => (e.stop_date === undefined || e.stop_hour === undefined) && e._id !== undefined)
    }
  },
  actions: {
    fetchCustomFields (context, payload) {
      context.state.$db
        .get('custom_fields')
        .then(fieldsDoc => {
          context.commit('setCustomFields', {doc: fieldsDoc})
        })
        .catch(() => {}) // error(s) about this, is/are not important
    },
    fetchActivities (context) {
      context.state.$db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          res.rows.forEach(row => {
            context.commit('setActivity', {doc: row.doc})
          })
        })
    },
    saveActivity (context, payload) {
      let db = context.state.$db

      return new Promise((resolve, reject) => {
        let errorFunc = err => { throw new Error(err) }

        let callBack = res => {
          if (!res.ok) {
            throw new Error()
          } else {
            db
              .get(res.id)
              .then(doc => {
                Vue.set(payload, 'doc', doc)
                context.commit('setActivity', payload)
                resolve(res)
              })
              .catch(errorFunc)
          }
        }

        if (payload.doc._id === undefined) {
          db
            .post(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        } else {
          db
            .put(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        }
      })
    },
    deleteActivity (context, payload) {
      return new Promise((resolve, reject) => {
        context.state.$db
          .remove(payload.doc)
          .then(res => {
            if (res.ok) {
              context.commit('removeActivity', payload)
              resolve()
            } else {
              throw new Error('IKE0042')
            }
          })
          .catch(err => { throw new Error(err) })
      })
    },
    saveCustomFields (context, payload) {
      return new Promise((resolve, reject) => {
        let errorFunc = err => { throw new Error(err) }

        let callBack = res => {
          if (!res.ok) {
            throw new Error()
          } else {
            context.state.$db
              .get(res.id)
              .then(doc => {
                Vue.set(payload, 'doc', doc)
                context.commit('setCustomFields', payload)
                resolve(res)
              })
              .catch(errorFunc)
          }
        }

        if (payload.doc._id === undefined) {
          payload.doc._id = 'custom_fields'
        }

        context.state.$db
          .put(payload.doc)
          .then(callBack)
          .catch(errorFunc)
      })
    },
    checkAndCreateViews (context, payload) {
      let allActivitiesPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('all_activities/all_activities')
          .then(() => { resolve() })
          .catch(() => {
            /* eslint-disable */
            var ddoc = {
              _id: '_design/all_activities',
              views: {
                all_activities: {
                  map: function (doc) {
if (doc.data_type) {
  if (doc.data_type === 'subject') {
    emit(doc._id, true);
  }
}
}.toString()
                }
              }
            }
            /* eslint-enable */

            context.state.$db
              .put(ddoc)
              .then(() => { resolve() })
              .catch(function (err) { throw new Error(err) })
          })
      })

      let subjectsPointsPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('subjects_powers/subjects_powers')
          .then(res => { resolve() })
          .catch(() => {
            /* eslint-disable */
            var ddoc = {
              _id: '_design/subjects_powers',
              views: {
                subjects_powers: {
                  map: function (doc) {
if(doc.subject) {
  emit(doc.subject, 1);
}
}.toString(),
                  reduce: function(keys, values, rereduce) {
return sum(values);
}.toString()
                }
              }
            }
            /* eslint-enable */

            context.state.$db
              .put(ddoc)
              .then(() => { resolve() })
              .catch(function (err) { throw new Error(err) })
          })
      })

      let categoriesPointsPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('categories_powers/categories_powers')
          .then(res => { resolve() })
          .catch(() => {
            /* eslint-disable */
            var ddoc = {
              _id: '_design/categories_powers',
              views: {
                categories_powers: {
                  map: function (doc) {
if(doc.categories) {
  doc.categories.forEach(e => {
    emit(e, 1);
  });
}
}.toString(),
                  reduce: function(keys, values, rereduce) {
return sum(values);
}.toString()
                }
              }
            }
            /* eslint-enable */

            context.state.$db
              .put(ddoc)
              .then(() => { resolve() })
              .catch(function (err) { throw new Error(err) })
          })
      })

      return Promise.all([
        allActivitiesPromise,
        subjectsPointsPromise,
        categoriesPointsPromise
      ])
    }
  }
}

const manager = {
  namespaced: true,
  state: {
    $db: new PouchDB('sessions'),
    current: 'ikiliptus',
    available: {
      ikiliptus: {
        _id: 'ikiliptus',
        name: 'default',
        color: '#1976D2',
        remote: ''
      }
    }
  },
  getters: {
    current (state) {
      return state.available[state.current]
    }
  },
  mutations: {
    setAvailable (state, payload) {
      let $db = new PouchDB(payload.doc._id.split('-').join(''))

      let $sync = null
      let $remote = null
      if (payload.doc.remote !== undefined && payload.doc.remote !== null && payload.doc.remote.trim() !== '') {
        $remote = new PouchDB(payload.doc.remote)
        $sync = $remote.sync($db, { live: true })
      }

      Vue.set(state.available, payload.doc._id, payload.doc)

      let newSession = Object.assign(session, {
        state: {
          doc: payload.doc,
          $db: $db,
          $sync: $sync,
          $remote: $remote,
          customFields: {
            _id: 'custom_fields',
            fields: []
          },
          activities: [],
          cachedSortedActivities: {
            refresh: true,
            value: []
          }
        }
      })

      store.registerModule(payload.doc._id, newSession)
    },
    setCurrent (state, payload) {
      Vue.set(state, 'current', payload.sessionID)
      tools.setCookie('last_session', payload.sessionID)
    },
    removeSession (state, payload) {
      Vue.delete(state.available, payload.sessionID)

      store.unregisterModule(payload.sessionID)
    }
  },
  actions: {
    fetchAvailable (context) {
      context.state.$db
        .allDocs({include_docs: true})
        .then(res => {
          res.rows.forEach(row => {
            context.commit('setAvailable', {doc: row.doc})
            context.dispatch(row.doc._id + '/fetchCustomFields', null, {root: true})
          })
        })
        .catch(err => { alert(err) })
    },
    setCurrent (context, payload) {
      context.commit('setCurrent', payload)
      context.dispatch(payload.sessionID + '/fetchActivities', null, {root: true})
      context.dispatch(payload.sessionID + '/checkAndCreateViews', null, {root: true})

      if (store.state[payload.sessionID].$sync !== null) {
        store.state[payload.sessionID].$sync
          .on('complete', (info) => {
            console.log('Sync on local CouchDB ' + store.state[payload.sessionID].doc.name + ' success.', info, arguments)
          })
          .on('change', (change) => {
            console.log('Sync event on ' + store.state[payload.sessionID].doc.name + ' :', change)

            if (change.direction === 'push') {
              change.change.docs.forEach(doc => {
                context.commit(payload.sessionID + '/setActivity', {doc: doc}, {root: true})
              })
            }
          })
          .on('error', (err) => {
            console.log('ERROR while sync on local couchDB ' + store.state[payload.sessionID].doc.name + ' :', err, arguments)
          })
      }
    },
    saveSession (context, payload) {
      return new Promise((resolve, reject) => {
        let errorFunc = err => { throw new Error(err) }

        let callBack = res => {
          if (!res.ok) {
            throw new Error()
          } else {
            context.state.$db
              .get(res.id)
              .then(doc => {
                Vue.set(payload, 'doc', doc)
                context.commit('setAvailable', payload)
                context.dispatch(res.id + '/fetchActivities', null, {root: true})
                context.dispatch(res.id + '/fetchCustomFields', null, {root: true})
                context
                  .dispatch(res.id + '/checkAndCreateViews', null, {root: true})
                  .then(() => resolve(res))
              })
              .catch(errorFunc)
          }
        }

        if (payload.doc._id === undefined) {
          context.state.$db
            .post(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        } else {
          context.state.$db
            .put(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        }
      })
    },
    deleteSession (context, payload) {
      return new Promise((resolve, reject) => {
        if (context.state.current === payload.doc._id) {
          context.dispatch('setCurrent', {sessionID: 'ikiliptus'})
        }

        store.state[payload.doc._id].$db
          .destroy()
          .catch(err => { alert('IKE0050:\n' + err) }) // not realy a problem

        context.state.$db
          .remove(payload.doc)
          .then(res => {
            if (res.ok) {
              context.commit('removeSession', {sessionID: payload.doc._id})
              resolve()
            } else {
              throw new Error('IKE0051')
            }
          })
          .catch(err => { throw new Error(err) })
      })
    }
  }
}

const store = new Vuex.Store({
  modules: {
    manager: manager
  }
})

export default store
