<template>
  <v-checkbox
    v-bind:label="settings.label"
    v-bind:disabled="disabled"
    v-model="valueCopy"
    v-on:change="customfieldchange"
    v-if="settings.type === 'checkbox'"
  ></v-checkbox>
  <v-text-field
    v-bind:label="settings.label"
    v-bind:prepend-icon="settings.icon"
    v-bind:disabled="disabled"
    v-model="valueCopy"
    v-on:input="customfieldchange"
    v-else
  ></v-text-field>
</template>

<script>
export default {
  name: 'CustomField',
  data () {
    return {
      valueCopy: ''
    }
  },
  props: ['settings', 'value', 'disabled'],
  watch: {
    value (newValue, oldValue) {
      this.valueCopy = newValue
    }
  },
  methods: {
    customfieldchange () {
      this.$emit('customfieldchange', {field: this.settings.name, value: this.valueCopy})
    }
  }
}
</script>
