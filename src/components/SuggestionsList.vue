<template>
  <v-card v-if="show && list && list.length > 0">
    <v-toolbar dark dense color="secondary">
      <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-on:click="$emit('suggestionhide', name)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list dense v-if="list && list.length > 0">
      <template v-for="found in list">
        <v-list-tile v-bind:key="'categories_suggest:' + found" v-on:click="$emit('suggestionselect', {field: name, value: found})">
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
  props: ['name', 'show', 'list']
}
</script>
