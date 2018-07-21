import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';
import PouchDB from 'pouchdb-browser';

import tools from './tools';

declare var atlan: any;

Vue.use(Vuex);

const session = {
  namespaced: true,
  state: {
    doc: {
      _id: 'ikiliptus',
      name: 'default',
      color: '#1976D2',
      remote: '',
    },
    $db: new PouchDB('ikiliptus'),
    $sync: null,
    $remote: null,
    customFields: {
      _id: 'custom_fields',
      fields: [],
    },
    activities: [],
    cachedSortedActivities: {
      refresh: true,
      value: [],
    },
  },
  mutations: {
    setCustomFields(state: any, payload: any) {
      Vue.set(state, 'customFields', payload.doc);
    },
    setActivity(state: any, payload: any) {
      if (payload.doc._id !== undefined) {
        if (payload.doc.categories === undefined) {
          Vue.set(payload.doc, 'categories', []);
        }

        let found = false;
        for (let i = 0; i < state.activities.length; i++) {
          if (state.activities[i]._id && state.activities[i]._id === payload.doc._id) {
            Vue.set(state.activities, i, payload.doc);
            found = true;
            break;
          }
        }

        if (!found) {
          state.activities.push(payload.doc);
        }

        Vue.set(state.cachedSortedActivities, 'refresh', true);
      }
    },
    removeActivity(state: any, payload: any) {
      for (let i = 0; i < state.activities.length; i++) {
        if (state.activities[i]._id && state.activities[i]._id === payload.doc._id) {
          state.activities.splice(i, 1);
          Vue.set(state.cachedSortedActivities, 'refresh', true);
          break;
        }
      }
    },
  },
  getters: {
    activitiesByID(state: any, getters: any) {
      const result = {};

      state.activities.forEach((activity: any) => {
        if (activity._id && activity._id.trim() !== '') {
          Vue.set(result, activity._id, activity);
        }
      });

      return result;
    },
    activitiesSortedByTime(state: any, getters: any) {
      if (!state.cachedSortedActivities.refresh) {
        return state.cachedSortedActivities.value;
      }

      Vue.set(state.cachedSortedActivities, 'value', state.activities
        .sort((a: any, b: any) => {
          const bTime: any =
            moment(b.start_date + ' ' + b.start_hour + ':' + b.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate();
          const aTime: any =
            moment(a.start_date + ' ' + a.start_hour + ':' + a.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate();

          return bTime - aTime;
        }),
      );
      Vue.set(state.cachedSortedActivities, 'refresh', false);
      return state.cachedSortedActivities.value;
    },
    finishedActivities(state: any, getters: any) {
      return getters.activitiesSortedByTime
        .filter((e: any) => e.stop_date !== undefined && e.stop_hour !== undefined && e._id !== undefined);
    },
    runningActivities(state: any, getters: any) {
      return getters.activitiesSortedByTime
        .filter((e: any) => (e.stop_date === undefined || e.stop_hour === undefined) && e._id !== undefined);
    },
  },
  actions: {
    fetchCustomFields(context: any, payload: any) {
      context.state.$db
        .get('custom_fields')
        .then((fieldsDoc: any) => {
          context.commit('setCustomFields', {doc: fieldsDoc});
        });
        // .catch(() => {}); errors about this are not important
    },
    fetchActivities(context: any) {
      context.state.$db
        .query('all_activities/all_activities', {include_docs: true})
        .then((res: any) => {
          res.rows.forEach((row: any) => {
            context.commit('setActivity', {doc: row.doc});
          });
        });
    },
    saveActivity(context: any, payload: any) {
      const db = context.state.$db;

      return new Promise((resolve, reject) => {
        const errorFunc = (err: any) => { throw new Error(err); };

        const callBack = (res: any) => {
          if (!res.ok) {
            throw new Error();
          } else {
            db
              .get(res.id)
              .then((doc: any) => {
                Vue.set(payload, 'doc', doc);
                context.commit('setActivity', payload);
                resolve(res);
              })
              .catch(errorFunc);
          }
        };

        if (payload.doc._id === undefined) {
          db
            .post(payload.doc)
            .then(callBack)
            .catch(errorFunc);
        } else {
          db
            .put(payload.doc)
            .then(callBack)
            .catch(errorFunc);
        }
      });
    },
    deleteActivity(context: any, payload: any) {
      return new Promise((resolve, reject) => {
        context.state.$db
          .remove(payload.doc)
          .then((res: any) => {
            if (res.ok) {
              context.commit('removeActivity', payload);
              resolve();
            } else {
              throw new Error('IKE0042');
            }
          })
          .catch((err: any) => { throw new Error(err); });
      });
    },
    saveCustomFields(context: any, payload: any) {
      return new Promise((resolve, reject) => {
        const errorFunc = (err: any) => { throw new Error(err); };

        const callBack = (res: any) => {
          if (!res.ok) {
            throw new Error();
          } else {
            context.state.$db
              .get(res.id)
              .then((doc: any) => {
                Vue.set(payload, 'doc', doc);
                context.commit('setCustomFields', payload);
                resolve(res);
              })
              .catch(errorFunc);
          }
        };

        if (payload.doc._id === undefined) {
          payload.doc._id = 'custom_fields';
        }

        context.state.$db
          .put(payload.doc)
          .then(callBack)
          .catch(errorFunc);
      });
    },
    checkAndCreateViews(context: any, payload: any) {
      const allActivitiesPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('all_activities/all_activities')
          .then(() => { resolve(); })
          .catch(() => {
            const ddoc = {
              _id: '_design/all_activities',
              views: {
                all_activities: {
                  map: 'function(doc: any) { \
if (doc.data_type) { \
  if (doc.data_type === \'subject\') { \
    emit(doc._id, true); \
  } \
} \
}',
                },
              },
            };

            context.state.$db
              .put(ddoc)
              .then(() => { resolve(); })
              .catch((err: any) => { throw new Error(err); });
          });
      });

      const subjectsPointsPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('subjects_powers/subjects_powers')
          .then((res: any) => { resolve(); })
          .catch(() => {
            const ddoc = {
              _id: '_design/subjects_powers',
              views: {
                subjects_powers: {
                  map: 'function(doc: any) { \
if(doc.subject) { \
  emit(doc.subject, 1); \
} \
}',
                  reduce: 'function(keys: any, values: any, rereduce: any) { \
return sum(values); \
}',
                },
              },
            };

            context.state.$db
              .put(ddoc)
              .then(() => { resolve(); })
              .catch((err: any) => { throw new Error(err); });
          });
      });

      const categoriesPointsPromise = new Promise((resolve, reject) => {
        context.state.$db
          .query('categories_powers/categories_powers')
          .then((res: any) => { resolve(); })
          .catch(() => {
            const ddoc = {
              _id: '_design/categories_powers',
              views: {
                categories_powers: {
                  map: 'function(doc: any) { \
if(doc.categories) { \
  doc.categories.forEach((e: any) => { \
    emit(e, 1); \
  }); \
} \
}',
                  reduce: 'function(keys: any, values: any, rereduce: any) { \
return sum(values); \
}',
                },
              },
            };

            context.state.$db
              .put(ddoc)
              .then(() => { resolve(); })
              .catch((err: any) => { throw new Error(err); });
          });
      });

      return Promise.all([
        allActivitiesPromise,
        subjectsPointsPromise,
        categoriesPointsPromise,
      ]);
    },
  },
};

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
        remote: '',
      },
    },
  },
  getters: {
    current(state: any) {
      return state.available[state.current];
    },
  },
  mutations: {
    setAvailable(state: any, payload: any) {
      const $db = new PouchDB(payload.doc._id.split('-').join(''));

      let $sync = null;
      let $remote = null;
      if (  payload.doc.remote !== undefined &&
            payload.doc.remote !== null &&
            payload.doc.remote.trim() !== ''
          ) {
        $remote = new PouchDB(payload.doc.remote);
        $sync = $remote.sync($db, { live: true });
      }

      Vue.set(state.available, payload.doc._id, payload.doc);

      const newSession = Object.assign(session, {
        state: {
          doc: payload.doc,
          $db: $db,
          $sync: $sync,
          $remote: $remote,
          customFields: {
            _id: 'custom_fields',
            fields: [],
          },
          activities: [],
          cachedSortedActivities: {
            refresh: true,
            value: [],
          },
        },
      });

      store.registerModule(payload.doc._id, newSession);
    },
    setCurrent(state: any, payload: any) {
      Vue.set(state, 'current', payload.sessionID);
      tools.setCookie('last_session', payload.sessionID);
    },
    removeSession(state: any, payload: any) {
      Vue.delete(state.available, payload.sessionID);

      store.unregisterModule(payload.sessionID);
    },
  },
  actions: {
    fetchAvailable(context: any) {
      context.state.$db
        .allDocs({include_docs: true})
        .then((res: any) => {
          res.rows.forEach((row: any) => {
            context.commit('setAvailable', {doc: row.doc});
            context.dispatch(row.doc._id + '/fetchCustomFields', null, {root: true});
          });
        })
        .catch((err: any) => { alert(err); });
    },
    setCurrent(context: any, payload: any) {
      context.commit('setCurrent', payload);
      context.dispatch(payload.sessionID + '/fetchActivities', null, {root: true});
      context.dispatch(payload.sessionID + '/checkAndCreateViews', null, {root: true});

      interface Gamma {
        name: string;
      }

      interface Beta {
        $sync: any|null;
        doc: Gamma;
      }

      interface Alpha {
        [key: string]: Beta;
      }

      const state = (store.state as Alpha);

      if (state.$sync !== null) {
        (state.$sync as any)
          .on('complete', (info: any) => {
            console.log(
              'Sync on local CouchDB ' + (state.doc as any).name + ' success.',
              info,
              arguments,
            );
          })
          .on('change', (change: any) => {
            console.log('Sync event on ' + (state.doc as any).name + ' :', change);

            if (change.direction === 'push') {
              change.change.docs.forEach((doc: any) => {
                context.commit(payload.sessionID + '/setActivity', {doc: doc}, {root: true});
              });
            }
          })
          .on('error', (err: any) => {
            console.log(
              'ERROR while sync on local couchDB ' + (state.doc as any).name + ' :',
              err,
              arguments,
            );
          });
      }
    },
    saveSession(context: any, payload: any) {
      return new Promise((resolve, reject) => {
        const errorFunc = (err: any) => { throw new Error(err); };

        const callBack = (res: any) => {
          if (!res.ok) {
            throw new Error();
          } else {
            context.state.$db
              .get(res.id)
              .then((doc: any) => {
                Vue.set(payload, 'doc', doc);
                context.commit('setAvailable', payload);
                context.dispatch(res.id + '/fetchActivities', null, {root: true});
                context.dispatch(res.id + '/fetchCustomFields', null, {root: true});
                context
                  .dispatch(res.id + '/checkAndCreateViews', null, {root: true})
                  .then(() => { resolve(res); });
              })
              .catch(errorFunc);
          }
        };

        if (payload.doc._id === undefined) {
          context.state.$db
            .post(payload.doc)
            .then(callBack)
            .catch(errorFunc);
        } else {
          context.state.$db
            .put(payload.doc)
            .then(callBack)
            .catch(errorFunc);
        }
      });
    },
    deleteSession(context: any, payload: any) {
      return new Promise((resolve, reject) => {
        if (context.state.current === payload.doc._id) {
          context.dispatch('setCurrent', {sessionID: 'ikiliptus'});
        }

        (store.state as {[key: string]: any})[payload.doc._id].$db
          .destroy()
          .catch((err: any) => { alert('IKE0050:\n' + err); }); // not realy a problem

        context.state.$db
          .remove(payload.doc)
          .then((res: any) => {
            if (res.ok) {
              context.commit('removeSession', {sessionID: payload.doc._id});
              resolve();
            } else {
              throw new Error('IKE0051');
            }
          })
          .catch((err: any) => { throw new Error(err); });
      });
    },
  },
};

const store = new Vuex.Store({
  modules: {
    manager: manager,
  },
});

export default store;
