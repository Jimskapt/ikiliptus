<template>
  <v-form>
    <v-text-field
      v-bind:label="$t('From')"
      v-model="newStart"
      prepend-icon="play_arrow"
      v-bind:disabled="locked.includes('from')"
    ></v-text-field>
    <v-text-field
      v-bind:label="$t('To')"
      v-model="newStop"
      prepend-icon="stop"
      v-bind:disabled="locked.includes('to')"
    ></v-text-field>
    <v-switch
      v-bind:label="$t('Voluntary')"
      v-model="newVoluntary"
      v-bind:disabled="locked.includes('voluntary')"
    ></v-switch>
    <v-text-field
      v-if="!newVoluntary"
      v-bind:label="$t('Medium')"
      v-model="newMedium"
      prepend-icon="phone"
      v-bind:disabled="locked.includes('medium')"
    ></v-text-field>
    <v-text-field
      v-if="!newVoluntary"
      v-bind:label="$t('Actor')"
      v-model="newActor"
      prepend-icon="people"
      v-bind:disabled="locked.includes('actor')"
    ></v-text-field>
    <v-text-field
      v-bind:label="$t('Details')"
      v-model="newDetails"
      prepend-icon="comment"
      v-bind:disabled="locked.includes('details')"
      multi-line
    ></v-text-field>
  </v-form>
</template>

<script>
export default {
  name: 'Interval',
  props: {
    id: {
      type: String,
      required: false,
      default () {
        return ''
      }
    },
    rev: {
      type: String,
      required: false,
      default () {
        return ''
      }
    },
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
    },
    locked: {
      type: Array,
      required: false,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      newStart: this.start,
      newStop: this.stop,
      newVoluntary: this.voluntary,
      newMedium: this.medium,
      newActor: this.actor,
      newDetails: this.details
    }
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
