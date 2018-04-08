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

      that.db.current.db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          return res.rows
            .map(e => {
              // TODO
            })
        })
        .then(res => {
          that.db.current.db.bulkDocs(res)
        })
        .then(res => {
          that.result = res
        })
        .catch(err => alert('IKE0012:\n' + err))
    */
  }
}
</script>
