<template lang="pug">
div
  h1 This is the 
    code main page
  p  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ullamcorper, lacus quis vulputate laoreet, lacus leo fringilla erat, consequat sollicitudin ex turpis quis lorem. Nunc eget sem bibendum, commodo ligula pharetra, dictum enim. Nulla at leo sit amet leo dapibus ultricies eget quis felis. Vestibulum euismod mauris sit amet lorem feugiat, eu feugiat risus pulvinar. Donec eu neque ultrices, semper ligula a, mollis lorem. Duis suscipit eros a placerat tincidunt. Nam sed imperdiet mauris. Nullam sit amet metus tellus. Suspendisse potenti. Phasellus convallis, ex at elementum condimentum, enim lectus mollis ante, vitae tempus lorem leo quis ligula. Quisque nec ligula dictum, dignissim diam id, lobortis lectus. Praesent lobortis bibendum justo, in sagittis mi consequat sit amet. 
  ComponentExample
  br
  i (Oh, and
    code {{ $t('message') }}
    | , BTW !)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// @ is an alias to /src
import ComponentExample from '@/components/ComponentExample.vue';

@Component({
  components: {
    ComponentExample,
  },
})
export default class Home extends Vue {}
</script>
