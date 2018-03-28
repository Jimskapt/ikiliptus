import PouchDB from 'pouchdb-browser'

let db = new PouchDB('ikiliptus')

function checkAndCreateViews () {
  let allActivitiesPromise = new Promise((resolve, reject) => {
    db
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

        db
          .put(ddoc)
          .then(() => { resolve() })
          .catch(function (err) { throw new Error(err) })
      })
  })

  let subjectsPointsPromise = new Promise((resolve, reject) => {
    db
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

        db
          .put(ddoc)
          .then(() => { resolve() })
          .catch(function (err) { throw new Error(err) })
      })
  })

  let mediumsPointsPromise = new Promise((resolve, reject) => {
    db
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

        db
          .put(ddoc)
          .then(() => { resolve() })
          .catch(function (err) { throw new Error(err) })
      })
  })

  let actorsPointsPromise = new Promise((resolve, reject) => {
    db
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

        db
          .put(ddoc)
          .then(() => { resolve() })
          .catch(function (err) { throw new Error(err) })
      })
  })

  let categoriesPointsPromise = new Promise((resolve, reject) => {
    db
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

        db
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
    categoriesPointsPromise
  ])
}

export default {
  kernel: db,
  checkAndCreateViews: checkAndCreateViews
}
