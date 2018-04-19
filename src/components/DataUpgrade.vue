<template>
  <pre style="font-size:10px;padding:30px;">{{result}}</pre>
</template>

<script>
export default {
  name: 'DataUpgrade',
  data () {
    return {
      result: {}
    }
  },
  mounted () {
    /*
      let that = this

      that.$sessions.current.db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          return res.rows
            .map(e => {
              // TODO
            })
        })
        .then(res => {
          that.$sessions.current.db.bulkDocs(res)
        })
        .then(res => {
          that.result = res
        })
        .catch(err => alert('IKE0012:\n' + err))
    */
  }
}
</script>
