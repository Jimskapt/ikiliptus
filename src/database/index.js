import PouchDB from 'pouchdb-browser'

let db = new PouchDB('ikiliptus')

db
  .query('all_activities/all_activities')
  .then(res => {})
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
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

db
  .query('subjects_powers/subjects_powers')
  .then(res => {})
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
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

db
  .query('mediums_powers/mediums_powers')
  .then(res => {})
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
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

db
  .query('actors_powers/actors_powers')
  .then(res => {})
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
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

db
  .query('categories_powers/categories_powers')
  .then(res => {})
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
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

export default db
