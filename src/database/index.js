import Vue from 'vue'
import PouchDB from 'pouchdb-browser'

import tools from '../tools/index.js'

let sessions = {
  db: new PouchDB('sessions'),
  available: [],
  eventBus: null,
  current: {
    _id: 'ikiliptus',
    name: 'default',
    color: '#1976D2',
    db: new PouchDB('ikiliptus'),
    $customFields: []
  },
  mount (id) {
    let simpleID = id.split('-').join('')
    return new PouchDB(simpleID)
  },
  setCurrent (doc, vuetify) {
    doc.db = sessions.mount(doc._id)
    Vue.set(sessions, 'current', doc)

    vuetify.theme.primary = doc.color

    tools.setCookie('last_session', doc._id)

    if (doc.remote !== undefined && doc.remote !== null && doc.remote !== '') {
      Vue.set(sessions.current, '$remote', sessions.current.db.sync(new PouchDB(doc.remote), {live: true}))

      sessions.current.$remote
        .on('complete', function () {
          console.log('Sync on local CouchDB success.')
          sessions.eventBus.$emit('dbupdate')
        })
        .on('error', function (err) {
          console.log('ERROR while sync on local couchDB :', err)
        })
        .on('change', function (change) {
          console.log('Sync event : ', change)
          sessions.eventBus.$emit('dbupdate', change)
        })
    }

    sessions.current.db
      .get('custom_fields')
      .then(doc => {
        Vue.set(sessions.current, '$customFields', doc.fields)
      })
  },
  refresh () {
    return new Promise((resolve, reject) => {
      sessions.db
        .get('ikiliptus')
        .catch(() => {
          return sessions.db
            .put({
              _id: 'ikiliptus',
              name: 'default',
              color: '#1976D2'
            })
        })
        .then(() => {
          sessions.db
            .allDocs({include_docs: true})
            .then(result => {
              Vue.set(sessions, 'available', [])

              result.rows.forEach(e => {
                sessions.available.push(e.doc)
              })

              resolve()
            })
            .catch(err => { throw new Error(err) })
        })
    })
  },
  checkAndCreateViews () {
    let allActivitiesPromise = new Promise((resolve, reject) => {
      sessions.current.db
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

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let subjectsPointsPromise = new Promise((resolve, reject) => {
      sessions.current.db
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

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let mediumsPointsPromise = new Promise((resolve, reject) => {
      sessions.current.db
        .query('mediums_powers/mediums_powers')
        .then(res => { resolve() })
        .catch(() => {
          /* eslint-disable */
          var ddoc = {
            _id: '_design/mediums_powers',
            views: {
              mediums_powers: {
                map: function (doc) {
  if(doc.medium) {
    emit(doc.medium, 1);
  }
}.toString(),
                reduce: function(keys, values, rereduce) {
  return sum(values);
}.toString()
              }
            }
          }
          /* eslint-enable */

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let actorsPointsPromise = new Promise((resolve, reject) => {
      sessions.current.db
        .query('actors_powers/actors_powers')
        .then(res => { resolve() })
        .catch(() => {
          /* eslint-disable */
          var ddoc = {
            _id: '_design/actors_powers',
            views: {
              actors_powers: {
                map: function (doc) {
  if(doc.actor) {
    emit(doc.actor, 1);
  }
}.toString(),
                reduce: function(keys, values, rereduce) {
  return sum(values);
}.toString()
              }
            }
          }
          /* eslint-enable */

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let categoriesPointsPromise = new Promise((resolve, reject) => {
      sessions.current.db
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

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let activitiesPerDayPromise = new Promise((resolve, reject) => {
      sessions.current.db
        .query('activities_per_day/activities_per_day')
        .then(res => { resolve() })
        .catch(() => {
          /* eslint-disable */
          var ddoc = {
            _id: '_design/activities_per_day',
            views: {
              activities_per_day: {
                map: function (doc) {
  if(doc.start_date && doc.stop_date) {
    if(doc.start_date == doc.stop_date) {
      emit(doc.start_date, 1);
    }
  } // else TODO !
}.toString(),
                reduce: function(keys, values, rereduce) {
  return sum(values);
}.toString()
              }
            }
          }
          /* eslint-enable */

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let durationPerDayPromise = new Promise((resolve, reject) => {
      sessions.current.db
        .query('duration_per_day/duration_per_day')
        .then(res => { resolve() })
        .catch(() => {
          /* eslint-disable */
          var ddoc = {
            _id: '_design/duration_per_day',
            views: {
              duration_per_day: {
                map: function (doc) {
  if(doc.start_date && doc.stop_date) {
    if(doc.start_date == doc.stop_date) {
      if(doc.start_hour && doc.stop_hour) {
        let stop = doc.stop_hour.split(':')
        let start = doc.start_hour.split(':')

        let stop_seconds = 0
        if(doc.stop_seconds) {
          stop_seconds = doc.stop_seconds
        }
        stop_seconds += parseInt(stop[1]) * 60
        stop_seconds += parseInt(stop[0]) * 3600

        let start_seconds = 0
        if(doc.start_seconds) {
          start_seconds = doc.start_seconds
        }
        start_seconds += parseInt(start[1]) * 60
        start_seconds += parseInt(start[0]) * 3600

        let delta = stop_seconds - start_seconds

        emit(doc.start_date, delta);
      }
    }
  } // else TODO !
}.toString(),
                reduce: function(keys, values, rereduce) {
  return sum(values);
}.toString()
              }
            }
          }
          /* eslint-enable */

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    let durationPerCategoryAndDayPromise = new Promise((resolve, reject) => {
      sessions.current.db
        .query('duration_per_category_and_day/duration_per_category_and_day')
        .then(res => { resolve() })
        .catch(() => {
          /* eslint-disable */
          var ddoc = {
            _id: '_design/duration_per_category_and_day',
            views: {
              duration_per_category_and_day: {
                map: function (doc) {
  if(doc.categories && doc.start_date && doc.stop_date) {
    if(doc.categories.length > 0) {
      if(doc.start_date == doc.stop_date) {
        let stop = doc.stop_hour.split(':')
        let start = doc.start_hour.split(':')

        let stop_seconds = 0
        if(doc.stop_seconds) {
          stop_seconds = doc.stop_seconds
        }
        stop_seconds += parseInt(stop[1]) * 60
        stop_seconds += parseInt(stop[0]) * 3600

        let start_seconds = 0
        if(doc.start_seconds) {
          start_seconds = doc.start_seconds
        }
        start_seconds += parseInt(start[1]) * 60
        start_seconds += parseInt(start[0]) * 3600

        let delta = stop_seconds - start_seconds

        for(let i = 0; i < doc.categories.length; i++) {
          emit([doc.categories[i], doc.start_date], delta)
        }
      } // else TODO !
    }
  }
}.toString(),
                reduce: function(keys, values, rereduce) {
  return sum(values)
}.toString()
              }
            }
          }
          /* eslint-enable */

          sessions.current.db
            .put(ddoc)
            .then(() => { resolve() })
            .catch(function (err) { throw new Error(err) })
        })
    })

    return Promise.all([
      allActivitiesPromise,
      subjectsPointsPromise,
      mediumsPointsPromise,
      actorsPointsPromise,
      categoriesPointsPromise,
      activitiesPerDayPromise,
      durationPerDayPromise,
      durationPerCategoryAndDayPromise
    ])
  }
}

export default sessions
