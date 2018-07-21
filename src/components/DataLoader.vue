<template>
  <div>
    <v-container>
      <v-btn large block @click="$router.go(-1)" color="error">
        <v-icon>keyboard_arrow_left</v-icon>
        <span>{{ $t('Go back') }}</span>
      </v-btn>
    </v-container>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>unarchive</v-icon>
            </v-btn>
            <span>{{ $t("Load") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-alert type="info" :value="true">
            {{ $t('Please paste your data in the following field and click on the LOAD button, in order to load them in this app') }}.
          </v-alert>

          <v-text-field multi-line v-model="input" :label="$t('Paste your data here')"></v-text-field>
        </v-container>
      </v-card>
    </v-container>
    <v-container>
      <v-btn large block @click="save" color="success">
        <v-icon>unarchive</v-icon>
        <span>{{ $t('Load') }}</span>
      </v-btn>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'DataLoader',
  data() {
    return {
      input: '',
    };
  },
  methods: {
    save() {
      const sessionID = this.$store.getters['manager/current']._id;

      const data = JSON.parse(this.input);

      data.forEach((e) => {
        this.$delete(e, '_rev');
        this.$store.dispatch(sessionID + '/saveActivity', {doc: e}, {root: true});
      });
    },
  },
};
</script>
