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
          <activity v-bind:id="id"></activity>
        </v-container>

        <v-card-actions>
          <v-btn color="red" v-on:click="$router.go(-1)">
            <v-icon>clear</v-icon>
            <span>{{ $t("Abort") }}</span>
          </v-btn>
          <v-btn color="green">
            <v-icon>done</v-icon>
            <span>{{ $t("OK") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

  </div>
</template>

<script>
import Activity from '@/components/Activity'

export default {
  name: 'ActivityEditor',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {}
  },
  methods: {},
  mounted () {},
  destroyed () {},
  components: {
    'activity': Activity
  }
}
</script>
