<script lang="ts">
	export let data;
</script>

<div class="admin-layout">
	<aside class="sidebar">
		<h2>Admin</h2>
		<nav>
			<a href="/admin/dashboard">Dashboard</a>
			<a href="/admin/users">Users</a>
		</nav>
	</aside>
	<main class="content">
		<header class="topbar">
			<span>Admin Panel</span>
			<a href="/admin/login">Logout</a>
		</header>
		<slot />
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: 100vh;
	}
	.sidebar {
		width: 220px;
		background: #111827;
		color: white;
		padding: 1rem;
	}
	.sidebar a {
		display: block;
		color: #d1d5db;
		margin-top: 0.75rem;
		text-decoration: none;
	}
	.content {
		flex: 1;
		background: #f9fafb;
	}
	.topbar {
		height: 56px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 1rem;
	}
</style>
