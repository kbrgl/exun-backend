function debug(message) {
  console.log(`[debug] ${message}`);
}

function url(route) {
  return `/api/v1/${route}`;
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
      {{ timestamps() }}
    </div>
    <a href="#" class="button" @click="del">{{ deleteButtonText }}</a>
  </div>
  `,
  methods: {
    marked,
    timestamps: function() {
      const c = new Date(this.post.created_at);
      const u = new Date(this.post.updated_at);
      let res = `Posted ${this.format(c)}`;
      if (c.getTime() !== u.getTime()) {
        res += `, updated ${this.format(u)}`;
      }
      return res;
    },
    format: function(date) {
      return date.toLocaleString('en-US');
    },
    del: function(event) {
      event.preventDefault();
      if (!window.confirm(`Are you sure you want to delete post '${this.post.title}'?`)) {
        return;
      }
      fetch(url(`posts/${this.post.id}`), {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            app.posts = await app.fetchPosts();
          } else {
            this.deleteButtonText = 'Could not delete';
            setTimeout(() => {
              this.deleteButtonText = 'Delete';
            }, 3000);
          }
        });
    },
  },
});

Vue.component('post-form', {
  data: () => ({
    title: '',
    body: '',
    error: '',
  }),
  template: `
  <form>
    <input type="text" placeholder="Title" v-model="title">
    <br>
    <br>
    <textarea placeholder="Body" name="body" v-model="body"></textarea>
    <br>
    <button class="button-primary" @click="post">Post</button>
    <p class="error">{{ error }}</p>
  </form>
  `,
  methods: {
    post: function(event) {
      event.preventDefault();
      const data = {
        title: this.title,
        body: this.body,
      };
      fetch(url('posts'), {
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
    del: function(event) {
      event.preventDefault();
      if (!window.confirm(`Are you sure you want to delete admin '${this.admin.email}'?`)) {
        return;
      }
      fetch(url(`admins/${this.admin.id}`), {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(async res => {
          if (res.ok) {
            app.admins = await app.fetchAdmins();
          }
        });
    },
  },
});

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
    add: function(event) {
      event.preventDefault();
      const email = window.prompt('Enter email');
      if (!email) {
        return;
      }
      const password = window.prompt('Set a password');
      if (!password) {
        return;
      }
      const data = {
        email,
        password,
      };
      let confirmation = window.prompt('Confirm password')
      while (confirmation !== data.password) {
        if (!confirmation) {
          return
        }
        confirmation = window.prompt('Wrong password, try again');
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
            debug('admin added');
            app.admins = await app.fetchAdmins();
          } else {
            this.error = res.message;
            debug(`error adding admin: ${res.message}`);
          }
        });
    },
  },
});

let app = new Vue({
  el: '#app',
  data: {
    posts: [],
    admins: [],
  },
  created: async function() {
    this.posts = await this.fetchPosts();
    this.admins = await this.fetchAdmins();
  },
  methods: {
    fetchPosts: async function() {
      const res = await fetch(url('posts'));
      const json = await res.json();
      return json.posts;
    },
    fetchAdmins: async function() {
      const res = await fetch(url('admins'), { credentials: 'include' });
      const json = await res.json();
      return json.admins;
    },
  },
});
