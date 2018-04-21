<template>
  <v-card v-if="display && list && list.length > 0">
    <v-toolbar dark dense color="secondary">
      <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="display = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list dense v-if="list && list.length > 0">
      <template v-for="found in list">
        <v-list-tile :key="'categories_suggest:' + found" @click="select(found)">
          <v-list-tile-action><v-icon>move_to_inbox</v-icon></v-list-tile-action>
          <v-list-tile-content>{{found}}</v-list-tile-content>
        </v-list-tile>
        <v-divider :key="'divider:' + found"></v-divider>
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
    event: 'change'
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
        this.$emit('change', copy)
      } else {
        this.$emit('change', value)
      }
    }
  }
}
</script>
