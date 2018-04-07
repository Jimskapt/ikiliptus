<template>
  <pre style="font-size:10px;padding:30px;">{{result}}</pre>
</template>

<script>
export default {
  name: 'Settings',
  data () {
    return {
      result: {}
    }
  },
  mounted () {
    /*
    let that = this

    that.db.kernel
      .query('all_activities/all_activities', {include_docs: true})
      .then(res => {
        return res.rows
          .filter(e => e.doc.stop_date !== undefined && e.doc.stop_hour !== undefined)
          .map(e => {
            // TODO here

            return e.doc
          })
      })
      .then(res => {
        that.db.kernel.bulkDocs(res)
      })
      .then(res => {
        that.result = res
      })
      .catch(err => alert('IKE0012:\n' + err))
    */
  }
}
</script>
