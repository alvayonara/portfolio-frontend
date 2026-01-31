<script lang="ts">
  let username = "";
  let password = "";
  let error = "";
  let loading = false;

  console.log("API BASE:", import.meta.env.VITE_API_BASE_URL);

  async function login() {
    error = "";
    loading = true;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      await fetch("/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.accessToken }),
      });

      window.location.href = "/admin/dashboard";
    } catch (e) {
      error = "Invalid username or password";
    } finally {
      loading = false;
    }
  }
</script>

<h1>Admin Login</h1>
<div class="login-box">
  <input placeholder="Username" bind:value={username} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button on:click={login} disabled={loading}>
    {loading ? "Logging in..." : "Login"}
  </button>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .login-box {
    max-width: 360px;
    margin: 4rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error {
    color: red;
  }
</style>
