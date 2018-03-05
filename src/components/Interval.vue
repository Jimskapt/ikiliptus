<template>
  <div>
    <p>
      <span v-if="start !== null">From {{start}}</span>
      <span v-if="stop !== null"> to {{stop}}</span>
    </p>
  </div>
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
    }
  },
  data () {
    return {}
  }
}
</script>
