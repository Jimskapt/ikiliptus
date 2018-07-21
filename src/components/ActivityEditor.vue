<template>
  <div>

    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>alarm</v-icon>
            </v-btn>
            <span>{{ $t("Activity") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-container grid-list-md>
            <v-layout row>
              <v-flex xs6>
                <v-btn block color="error" @click="$router.go(-1)">
                  <v-icon>clear</v-icon>
                  <span>{{ $t("Abort") }}</span>
                </v-btn>
              </v-flex>
              <v-flex xs6>
                <v-btn block color="success" @click="$eventBus.$emit('save')">
                  <v-icon>done</v-icon>
                  <span>{{ $t("OK") }}</span>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>

          <activity-form :id="id"></activity-form>

          <v-container grid-list-md>
            <v-layout row>
              <v-flex xs6>
                <v-btn block color="error" @click="$router.go(-1)">
                  <v-icon>clear</v-icon>
                  <span>{{ $t("Abort") }}</span>
                </v-btn>
              </v-flex>
              <v-flex xs6>
                <v-btn block color="success" @click="$eventBus.$emit('save')">
                  <v-icon>done</v-icon>
                  <span>{{ $t("OK") }}</span>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-container>
      </v-card>
    </v-container>

  </div>
</template>

<script>
import ActivityForm from '@/components/ActivityForm';

export default {
  name: 'ActivityEditor',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  methods: {
    routerGoBack() {
      const that = this;

      setTimeout(() => {
        that.$router.go(-1);
      }, 1000);
    },
  },
  components: {
    activityForm: ActivityForm,
  },
  mounted() {
    this.$eventBus.$on('saveconfirm', this.routerGoBack);
  },
  destroyed() {
    this.$eventBus.$off('saveconfirm', this.routerGoBack);
  },
};
</script>
