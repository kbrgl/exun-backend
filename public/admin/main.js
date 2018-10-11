/* eslint-disable no-alert */
/* globals Vue: false, marked: false */

function debug(message) {
  // eslint-disable-next-line no-console
  console.log(`[debug] ${message}`)
}

function url(route) {
  return `/api/v1/${route}`
}

// Vue

Vue.component('post', {
  props: ['post'],
  data: () => ({
    deleteButtonText: 'Delete',
  }),
  template: `
  <div class="post">
    <h2>{{ post.title }}</h2>
    <p v-html="marked(post.body)"></p>
    <div class="post-metadata">
      {{ timestamps() }}<br>
      ID: {{ post.id }}
    </div>
    <a href="#" class="button" @click="del">{{ deleteButtonText }}</a>
  </div>
  `,
  methods: {
    marked,
    timestamps() {
      const c = new Date(this.post.created_at)
      const u = new Date(this.post.updated_at)
      let res = `Posted ${this.format(c)}`
      if (c.getTime() !== u.getTime()) {
        res += `, updated ${this.format(u)}`
      }
      return res
    },
    format(date) {
      return date.toLocaleString('en-US')
    },
    del(event) {
      event.preventDefault()
      if (!window.confirm(`Are you sure you want to delete post '${this.post.title}'?`)) {
        return
      }
      fetch(url(`posts/${this.post.id}`), {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            app.posts = await app.fetchPosts()
          } else {
            this.deleteButtonText = 'Could not delete'
            setTimeout(() => {
              this.deleteButtonText = 'Delete'
            }, 3000)
          }
        })
    },
  },
})

Vue.component('post-form', {
  data: () => ({
    id: null,
    title: '',
    body: '',
    error: '',
    shouldNotify: false,
    isTest: false,
    shouldPost: true,
  }),
  template: `
  <form>
    <p class="error" v-if="error.trim() != ''">{{ error }}</p>
    <input type="number" placeholder="ID (only for editing existing post)" v-model="id">
    <br>
    <br>
    <input type="text" placeholder="Title" v-model="title">
    <br>
    <br>
    <textarea placeholder="Body" v-model="body"></textarea>
    <br>
    <div v-if="!id">
      <input type="checkbox" v-model="shouldPost"> Post &nbsp;
      <input type="checkbox" v-model="shouldNotify"> Notify &nbsp;
      <span v-if="shouldNotify"><input type="checkbox" v-model="isTest"> Test</span>
    </div>
    <button class="button-primary" @click="post">Publish</button>
  </form>
  `,
  methods: {
    post(event) {
      event.preventDefault()
      if (!(this.$data.shouldPost || this.$data.shouldNotify)) {
        this.$data.error = 'No action selected'
        return
      }
      const newPostData = {
        shouldPost: this.$data.shouldPost,
        shouldNotify: this.$data.shouldNotify,
        isTest: this.$data.shouldNotify ? this.$data.isTest : false,
      }
      let data = {
        title: this.$data.title,
        body: this.$data.body,
      }
      if (!this.$data.id) {
        data = Object.assign(data, newPostData)
      }
      const idUrl = this.$data.id ? `/${this.$data.id}` : ''
      fetch(url(`posts${idUrl}`), {
        method: this.$data.id ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            this.$data.title = ''
            this.$data.body = ''
            this.$data.shouldPost = false
            this.$data.shouldNotify = false
            this.$data.isTest = false
            this.$data.error = ''
            debug('post posted')
            app.posts = await app.fetchPosts()
          } else {
            this.$data.error = res.message
            debug(`error during post: ${res.message}`)
          }
        })
    },
  },
})

Vue.component('admin', {
  props: ['admin'],
  template: `
    <div class="admin">
      {{admin.email}}
      <div class="edit-box">
        <div class="delete button" @click="del">Delete</div>
      </div>
    </div>
  `,
  methods: {
    del(event) {
      event.preventDefault()
      if (!window.confirm(`Are you sure you want to delete admin '${this.admin.email}'?`)) {
        return
      }
      fetch(url(`admins/${this.admin.id}`), {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            app.admins = await app.fetchAdmins()
          }
        })
    },
  },
})

Vue.component('admin-list', {
  props: ['admins'],
  template: `
    <div>
      <h2>Admins</h2>
      <div class="admin-list">
        <admin v-for="admin in admins" :key="admin.id" :admin="admin"></admin>
      </div>
      <a @click="add" class="button">Add Admin</a>
    </div>
  `,
  methods: {
    add(event) {
      event.preventDefault()
      const email = window.prompt('Enter email')
      if (!email) {
        return
      }
      const password = window.prompt('Set a password')
      if (!password) {
        return
      }
      const data = {
        email,
        password,
      }
      let confirmation = window.prompt('Confirm password')
      while (confirmation !== data.password) {
        if (!confirmation) {
          return
        }
        confirmation = window.prompt('Wrong password, try again')
      }
      fetch(url('admins'), {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            debug('admin added')
            app.admins = await app.fetchAdmins()
          } else {
            this.error = res.message
            debug(`error adding admin: ${res.message}`)
          }
        })
    },
  },
})

let app = new Vue({
  el: '#app',
  data: {
    posts: [],
    admins: [],
  },
  async created() {
    this.posts = await this.fetchPosts()
    this.admins = await this.fetchAdmins()
  },
  methods: {
    async fetchPosts() {
      const res = await fetch(url('posts'))
      const json = await res.json()
      return json.posts
    },
    async fetchAdmins() {
      const res = await fetch(url('admins'), { credentials: 'include' })
      const json = await res.json()
      return json.admins
    },
  },
})
