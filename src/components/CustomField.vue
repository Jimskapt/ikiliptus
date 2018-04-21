<template>
  <v-checkbox
    :label="settings.label"
    :disabled="disabled"
    v-model="valueCopy"
    @change="$emit('change', valueCopy)"
    v-if="settings.type === 'checkbox'"
  ></v-checkbox>
  <v-text-field
    :label="settings.label"
    :prepend-icon="settings.icon"
    :disabled="disabled"
    v-model="valueCopy"
    @input="$emit('change', valueCopy)"
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
