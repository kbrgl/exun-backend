function debug(message) {
  console.log(`[debug] ${message}`);
}

// Vue

Vue.component('post', {
  props: ['title', 'body'],
  template: `
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ body }}</p>
  </div>
  `,
});

Vue.component('post-form', {
  data: () => ({
    title: '',
    body: '',
    error: '',
  }),
  template: `
  <div class="card">
    <form>
      <input class="text-lg" type="text" placeholder="Title" v-model="title">
      <br>
      <br>
      <textarea placeholder="Body" name="body" v-model="body"></textarea>
      <br>
      <button @click="post">Post</button>
      <p class="error">{{ error }}</p>
    </form>
  </div>
  `,
  methods: {
    post: function(event) {
      event.preventDefault();
      const data = JSON.stringify({
        title: this.title,
        body: this.body,
      });
      fetch('/api/v1/posts', {
        method: 'POST',
        body: data,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            this.title = '';
            this.body = '';
            debug('post posted');
            app.posts = await app.fetchPosts();
          } else {
            this.error = res.message;
            debug(`error during post: ${res.message}`);
          }
        });
    },
  },
});

Vue.component('user', {
  props: ['email'],
  template: `
    <div class="user">
      {{email}}
    </div>
  `,
});

let app = new Vue({
  el: '#app',
  data: {
    posts: [],
    users: [],
  },
  created: async function() {
    this.posts = await this.fetchPosts();
    this.users = await this.fetchUsers();
  },
  methods: {
    fetchPosts: async function() {
      const res = await fetch('/api/v1/posts');
      const json = await res.json();
      return json.posts;
    },
    fetchUsers: async function() {
      const res = await fetch('/api/v1/users', { credentials: 'include' });
      const json = await res.json();
      return json.users;
    },
  },
});
