import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import PouchDB from 'pouchdb-browser'

import tools from '../tools/index.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    available: {
      ikiliptus: {
        doc: {
          _id: 'ikiliptus',
          name: 'default',
          color: '#1976D2',
          remote: ''
        },
        $db: new PouchDB('ikiliptus'),
        $sync: null,
        $remote: null,
        customFields: {fields: []},
        activities: {}
      }
    },
    current: 'ikiliptus',
    $sessionsDB: new PouchDB('sessions')
  },
  mutations: {
    setCurrent (state, payload) {
      Vue.set(state, 'current', payload.sessionID)
      tools.setCookie('last_session', payload.sessionID)
    },
    setAvailable (state, payload) {
      let $db = new PouchDB(payload.doc._id.split('-').join(''))

      let $sync = null
      let $remote = null
      if (payload.doc.remote !== undefined && payload.doc.remote !== null && payload.doc.remote.trim() !== '') {
        $remote = new PouchDB(payload.doc.remote)
        $sync = $remote.sync($db, { live: true })
      }

      Vue.set(state.available, payload.doc._id, {
        doc: payload.doc,
        $db: $db,
        $sync: $sync,
        $remote: $remote,
        customFields: {fields: []},
        activities: {}
      })
    },
    setCustomFields (state, payload) {
      Vue.set(state.available[payload.sessionID], 'customFields', payload.doc)
    },
    setActivity (state, payload) {
      if (payload.doc._id !== undefined) {
        if (payload.doc.categories === undefined) {
          Vue.set(payload.doc, 'categories', [])
        }
        Vue.set(state.available[payload.sessionID].activities, payload.doc._id, payload.doc)
      }
    },
    removeActivity (state, payload) {
      Vue.delete(state.available[payload.sessionID].activities, payload.doc._id)
    },
    removeSession (state, payload) {
      Vue.delete(state.available, payload.sessionID)
    }
  },
  getters: {
    current: state => {
      return state.available[state.current]
    },
    activitiesSortedByTime: state => sessionID => {
      return Object.values(state.available[sessionID].activities)
        .sort((a, b) => {
          let bTime = moment(b.start_date + ' ' + b.start_hour + ':' + b.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()
          let aTime = moment(a.start_date + ' ' + a.start_hour + ':' + a.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()

          return bTime - aTime
        })
    },
    finishedActivities: (state, getters) => sessionID => {
      return getters.activitiesSortedByTime(sessionID)
        .filter(e => e.stop_date !== undefined && e.stop_hour !== undefined && e._id !== undefined)
    },
    runningActivities: (state, getters) => sessionID => {
      return getters.activitiesSortedByTime(sessionID)
        .reverse()
        .filter(e => (e.stop_date === undefined || e.stop_hour === undefined) && e._id !== undefined)
    }
  },
  actions: {
    setCurrent (context, payload) {
      context.commit('setCurrent', payload)
      context.dispatch('fetchActivities', payload)
      context.dispatch('checkAndCreateViews', payload)

      if (context.state.available[payload.sessionID].$sync !== null) {
        context.state.available[payload.sessionID].$sync
          .on('complete', (info) => {
            console.log('Sync on local CouchDB ' + context.state.available[payload.sessionID].doc.name + ' success.', info, arguments)
          })
          .on('change', (change) => {
            console.log('Sync event on ' + context.state.available[payload.sessionID].doc.name + ' :', change)

            if (change.direction === 'push') {
              change.change.docs.forEach(doc => {
                context.commit('setActivity', {sessionID: payload.sessionID, doc: doc})
              })
            }
          })
          .on('error', (err) => {
            console.log('ERROR while sync on local couchDB ' + context.state.available[payload.sessionID].doc.name + ' :', err, arguments)
          })
      }
    },
    fetchAvailable (context) {
      context.state.$sessionsDB
        .allDocs({include_docs: true})
        .then(res => {
          res.rows.forEach(row => {
            context.commit('setAvailable', {doc: row.doc})
            context.dispatch('fetchCustomFields', {sessionID: row.doc._id})
          })
        })
        .catch(err => { alert(err) })
    },
    fetchCustomFields (context, payload) {
      context.state.available[payload.sessionID].$db
        .get('custom_fields')
        .then(fieldsDoc => {
          context.commit('setCustomFields', {sessionID: payload.sessionID, doc: fieldsDoc})
        })
        .catch(() => {}) // error(s) about this, is/are not important
    },
    fetchActivities (context, payload) {
      context.state.available[payload.sessionID].$db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          res.rows.forEach(row => {
            context.commit('setActivity', {sessionID: payload.sessionID, doc: row.doc})
          })
        })
    },
    saveActivity (context, payload) {
      let db = context.state.available[payload.sessionID].$db

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
        context.state.available[payload.sessionID].$db
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
    saveSession (context, payload) {
      return new Promise((resolve, reject) => {
        let errorFunc = err => { throw new Error(err) }

        let callBack = res => {
          if (!res.ok) {
            throw new Error()
          } else {
            context.state.$sessionsDB
              .get(res.id)
              .then(doc => {
                Vue.set(payload, 'doc', doc)
                context.commit('setAvailable', payload)
                context.dispatch('fetchActivities', {sessionID: res.id})
                context.dispatch('checkAndCreateViews', {sessionID: res.id})
                resolve(res)
              })
              .catch(errorFunc)
          }
        }

        if (payload.doc._id === undefined) {
          context.state.$sessionsDB
            .post(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        } else {
          context.state.$sessionsDB
            .put(payload.doc)
            .then(callBack)
            .catch(errorFunc)
        }
      })
    },
    deleteSession (context, payload) {
      return new Promise((resolve, reject) => {
        if (context.getters.current.doc._id === payload.doc._id) {
          context.dispatch('setCurrent', {sessionID: 'ikiliptus'})
        }

        context.state.available[payload.doc._id].$db
          .destroy()
          .catch(err => { alert('IKE0050:\n' + err) }) // not realy a problem

        context.state.$sessionsDB
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
    },
    saveCustomFields (context, payload) {
      return new Promise((resolve, reject) => {
        let errorFunc = err => { throw new Error(err) }

        let callBack = res => {
          if (!res.ok) {
            throw new Error()
          } else {
            context.state.available[payload.sessionID].$db
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

        context.state.available[payload.sessionID].$db
          .put(payload.doc)
          .then(callBack)
          .catch(errorFunc)
      })
    },
    checkAndCreateViews (context, payload) {
      let allActivitiesPromise = new Promise((resolve, reject) => {
        context.state.available[payload.sessionID].$db
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

            context.state.available[payload.sessionID].$db
              .put(ddoc)
              .then(() => { resolve() })
              .catch(function (err) { throw new Error(err) })
          })
      })

      let subjectsPointsPromise = new Promise((resolve, reject) => {
        context.state.available[payload.sessionID].$db
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

            context.state.available[payload.sessionID].$db
              .put(ddoc)
              .then(() => { resolve() })
              .catch(function (err) { throw new Error(err) })
          })
      })

      let categoriesPointsPromise = new Promise((resolve, reject) => {
        context.state.available[payload.sessionID].$db
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

            context.state.available[payload.sessionID].$db
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
})
