<template>
  <pre style="font-size:11px;padding:30px;">{{result}}</pre>
</template>

<script>
export default {
  name: 'DataUpgrade',
  data() {
    return {
      result: {},
    };
  },
  mounted() {
    /*
    let that = this

    that.$store.state[that.$store.getters['manager/current']._id].$db
      .query('all_activities/all_activities', {include_docs: true})
      .then(res => {
        return res.rows
          .map(e => {
            return e
          })
      })
      .then(res => {
        res.forEach(row => {
          that.$set(that.result, row.doc._id, dow.doc)
        })
      })
      .catch(err => alert('IKE0012:\n' + err))
    */
  },
};
</script>
