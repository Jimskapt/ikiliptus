<template>
  <div>
    <v-checkbox
      :label="settings.label"
      :disabled="disabled"
      v-model="valueCopy"
      v-if="settings.type === 'checkbox'"
    ></v-checkbox>
    <template v-else>
      <v-text-field
        :label="settings.label"
        :prepend-icon="settings.icon"
        :disabled="disabled"
        v-model="valueCopy"
        append-icon="close"
        :append-icon-cb="() => {valueCopy=''}"
      ></v-text-field>
      <suggestions-list
        :name="settings.name"
        :list="filteredList"
        v-model="valueCopy"
        v-if="!disabled"
      ></suggestions-list>
    </template>
  </div>
</template>

<script>
import SuggestionsList from '@/components/SuggestionsList';

export default {
  name: 'CustomField',
  components: {
    suggestionsList: SuggestionsList,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: ['settings', 'value', 'disabled', 'autocomplete'],
  data() {
    return {
      valueCopy: '',
      list: [],
    };
  },
  watch: {
    value(newValue) {
      this.valueCopy = newValue;
    },
    valueCopy(newValue) {
      this.$emit('change', newValue);
    },
  },
  methods: {
    fetchAutocompleteData() {
      if (this.settings.type !== 'checkbox') {
        const that = this;

        that.$store.state[that.$store.state.manager.current].$db
          .query('all_activities/all_activities', {include_docs: true})
          .then((res) => {
            const temp = {};

            res.rows.forEach((item) => {
              if (  item.doc[that.settings.name] !== undefined &&
                    item.doc[that.settings.name] !== null &&
                    item.doc[that.settings.name] !== '') {
                that.$set(temp, item.doc[that.settings.name], true);
              }
            });

            that.list = Object.keys(temp);
          })
          .catch((err) => { alert('IKE0038:\n' + err); });
      }
    },
  },
  computed: {
    filteredList() {
      if (this.list === undefined) {
        return [];
      }

      return this.list
        .filter((e) => {
          return e.toLowerCase().includes(this.valueCopy.toLowerCase()) && e !== this.valueCopy;
        })
        .sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    },
  },
  mounted() {
    this.valueCopy = this.value;

    if (this.autocomplete) {
      this.fetchAutocompleteData();
    }
  },
};
</script>
