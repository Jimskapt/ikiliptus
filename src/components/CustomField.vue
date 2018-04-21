<template>
  <v-checkbox
    v-bind:label="settings.label"
    v-bind:disabled="disabled"
    v-model="valueCopy"
    v-on:change="$emit('change', valueCopy)"
    v-if="settings.type === 'checkbox'"
  ></v-checkbox>
  <v-text-field
    v-bind:label="settings.label"
    v-bind:prepend-icon="settings.icon"
    v-bind:disabled="disabled"
    v-model="valueCopy"
    v-on:input="$emit('change', valueCopy)"
    v-else
  ></v-text-field>
</template>

<script>
export default {
  name: 'CustomField',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ['settings', 'value', 'disabled'],
  data () {
    return {
      valueCopy: ''
    }
  },
  watch: {
    value (newValue) {
      this.valueCopy = newValue
    }
  },
  mounted () {
    this.valueCopy = this.value
  }
}
</script>
