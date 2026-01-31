<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const menus = [
    { name: "Profile", path: "/admin/profile" },
    { name: "Experience", path: "/admin/experiences" },
    { name: "Projects", path: "/admin/projects" },
    { name: "Educations", path: "/admin/educations" },
    { name: "Skills", path: "/admin/skills" },
    { name: "Resume", path: "/admin/resume" },
  ];

  async function logout() {
    await fetch("/admin/logout", { method: "POST" });
    goto("/admin/login");
  }
</script>

<div class="layout">
  <aside class="sidebar">
    <h2>Admin Panel</h2>
    <nav>
      {#each menus as menu}
        <a
          href={menu.path}
          class:active={$page.url.pathname.startsWith(menu.path)}
        >
          {menu.name}
        </a>
      {/each}
    </nav>

    <button class="logout" on:click={logout}>Logout</button>
  </aside>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
    background: #f6f7fb;
  }

  aside {
    width: 220px;
    background: #0f172a;
    color: white;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  h2 {
    margin-bottom: 1rem;
  }

  nav a {
    display: block;
    padding: 0.6rem;
    color: #cbd5f5;
    text-decoration: none;
    border-radius: 6px;
  }

  nav a.active,
  nav a:hover {
    background: #1e293b;
    color: white;
  }

  .logout {
    margin-top: auto;
    background: #ef4444;
    border: none;
    padding: 0.6rem;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }

  main {
    flex: 1;
    padding: 2rem;
  }
</style>
