<template>
  <v-card v-if="display && list && list.length > 0">
    <v-toolbar dark dense color="secondary">
      <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-on:click="display = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list dense v-if="list && list.length > 0">
      <template v-for="found in list">
        <v-list-tile v-bind:key="'categories_suggest:' + found" v-on:click="select(found)">
          <v-list-tile-action><v-icon>move_to_inbox</v-icon></v-list-tile-action>
          <v-list-tile-content>{{found}}</v-list-tile-content>
        </v-list-tile>
        <v-divider v-bind:key="'divider:' + found"></v-divider>
      </template>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: 'SuggestionsList',
  props: ['name', 'list', 'value'],
  model: {
    prop: 'value',
    event: 'select'
  },
  data () {
    return {
      display: this.name === 'categories'
    }
  },
  watch: {
    value (newValue, oldValue) {
      let before = ''
      if (Array.isArray(oldValue)) {
        before = oldValue.join(',')
      } else {
        before = 'not an Array'
      }

      let after = ''
      if (Array.isArray(newValue)) {
        after = newValue.join(',')
      } else {
        after = 'not an Array'
      }

      if (before === after || after === '') {
        this.display = true
      }
    }
  },
  methods: {
    select (value) {
      if (Array.isArray(this.value)) {
        let copy = this.value
        copy.push(value)
        this.$emit('select', copy)
      } else {
        this.$emit('select', value)
      }
    }
  }
}
</script>
