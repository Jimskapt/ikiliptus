<template>
  <table>
    <tr v-if="start !== null">
      <td>{{ $t("From") }}</td>
      <td>{{start}}</td>
    </tr>
    <tr v-if="stop !== null">
      <td>{{ $t("To") }}</td>
      <td>{{stop}}</td>
    </tr>
    <tr>
      <td>{{ $t("Voluntary") }}</td>
      <td><span v-if="voluntary">{{ $t("Yes") }}</span><span v-else>{{ $t("No") }}</span></td>
    </tr>
    <tr v-if="!voluntary">
      <td>{{ $t("Medium") }}</td>
      <td>{{medium}}</td>
    </tr>
    <tr v-if="!voluntary">
      <td>{{ $t("Actor") }}</td>
      <td>{{actor}}</td>
    </tr>
    <tr>
      <td>{{ $t("Details") }}</td>
      <td>{{details}}</td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'Interval',
  props: {
    start: {
      type: Date,
      required: true
    },
    stop: {
      type: Date,
      required: false,
      default () {
        return null
      }
    },
    details: {
      type: String,
      required: false,
      default () {
        return ''
      }
    },
    voluntary: {
      type: Boolean,
      required: false,
      default () {
        return false
      }
    },
    medium: {
      type: String,
      required: false,
      default () {
        return ''
      }
    },
    actor: {
      type: String,
      required: false,
      default () {
        return ''
      }
    }
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  margin: 15px;
}
td {
  border: 1px solid black;
  padding-left: 5px;
  padding-right: 5px;
}
</style>
