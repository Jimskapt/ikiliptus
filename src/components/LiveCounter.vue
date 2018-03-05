<template>
  <div>
    <h1>Live Counter</h1>

    <div v-if="current !== null">
      <interval v-bind:start="current.start"></interval>
    </div>
    <p v-else>Counter is not started.</p>

    <button v-on:click="startCounter" v-bind:disabled="current !== null">START</button>
    <button v-on:click="stopCounter" v-bind:disabled="current === null">STOP</button>
    <button v-on:click="nextCounter" v-bind:disabled="current === null">NEXT</button>

    <div v-if="staged.length > 0">
      <p>Staged activities :</p>
      <interval
        v-bind:start="new Date(item.start)"
        v-bind:stop="(item.stop == 'null' || item.stop == null) ? null : new Date(item.stop)"
        v-for="item in staged"
        v-bind:key="item._id"
      ></interval>
    </div>
  </div>
</template>

<script>
import Interval from '@/components/Interval'

export default {
  name: 'LiveCounter',
  data () {
    return {
      current: null,
      staged: []
    }
  },
  methods: {
    startCounter () {
      this.current = {
        start: new Date()
      }

      let that = this
      this.db.staged.post(this.current, {}, function (err, res) {
        if (err) {
          alert(err)
        }

        if (res.ok === true) {
          that.current._id = res.id
          that.current._rev = res.rev

          that.fetchAllStaged()
        } else {
          alert('Not OK !')
          console.log(res)
        }
      })
    },
    stopCounter () {
      this.current.stop = new Date()
      this.db.staged.put(this.current, function (err, res) {
        if (err) {
          alert(err)
        }
      })

      this.fetchAllStaged()

      this.current = null
    },
    nextCounter () {
      this.stopCounter()
      this.startCounter()
    },
    fetchAllStaged () {
      let that = this

      this.db.staged.allDocs({include_docs: true}, function (err, doc) {
        if (err != null) {
          alert(err)
        } else {
          that.staged = []
          doc.rows.forEach(e => {
            that.staged.push(e.doc)
          })
        }
      })
    }
  },
  mounted () {
    this.fetchAllStaged()
  },
  components: {
    'interval': Interval
  }
}
</script>
