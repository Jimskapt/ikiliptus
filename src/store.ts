import Vue from 'vue';
import Vuex, { StoreOptions, Module } from 'vuex';

Vue.use(Vuex);

// https://codeburst.io/vuex-and-typescript-3427ba78cfa8

interface RootState {
    current: string;
}

interface SessionState {
    name: string;
}

const namespaced: boolean = true;

const ikiliptusState: SessionState = {
    name: 'Default',
};

const ikiliptus: Module<SessionState, RootState> = {
    namespaced,
    state: {
        name: 'Default',
    },
};

interface SetCurrentPayload {
    value: string;
}

const RootStore: StoreOptions<RootState> = {
    state: {
        current: 'ikiliptus',
    },
    mutations: {
        setCurrent(state, payload: SetCurrentPayload): boolean {
            if(payload.value === undefined || payload.value === null) {
                console.log('Error : mutations.setCurrent : missing <value> key');
            } else {
                if(state[payload.value as keyof(RootState)] === undefined) {
                    console.log(
                        'Error : mutations.setCurrent : the module',
                        payload.value,
                        'does not exists in the store');
                } else {
                    state.current = payload.value;
                    return true;
                }
            }

            return false;
        },
    },
    modules: {
        ikiliptus: ikiliptus,
    },
};

export default new Vuex.Store<RootState>(RootStore);
