<script lang="ts">
  import { API_BASE_URL } from '$lib/env';
  
  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  async function login() {
    error = '';
    loading = true;

    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        }
      );

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();

      const sessionRes = await fetch('/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token })
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to create session');
      }

      window.location.href = '/admin/profile';
    } catch (e) {
      error = 'Invalid username or password';
    } finally {
      loading = false;
    }
  }
</script>

<h1>Admin Login</h1>

<div class="login-box">
  <input placeholder="Username" bind:value={username} />
  <input
    type="password"
    placeholder="Password"
    bind:value={password}
  />

  <button on:click={login} disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  h1 {
    text-align: center;
    margin-top: 3rem;
  }

  .login-box {
    max-width: 360px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    padding: .6rem;
    font-size: 1rem;
  }

  button {
    padding: .6rem;
    background: #2563eb;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:disabled {
    opacity: .6;
  }

  .error {
    color: red;
    text-align: center;
  }
</style>