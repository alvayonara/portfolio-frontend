<script lang="ts">
  import type { PageData } from "./$types";
  import SkillList from "./SkillList.svelte";
  export let data: PageData;
  let selectedGroup: any = null;
</script>

<h1>Skills</h1>

<div class="layout">
  <!-- GROUPS -->
  <aside>
    <h3>Skill Groups</h3>

    <form method="POST" action="?/createGroup">
      <input name="name" placeholder="New group name" required />
      <button>Add</button>
    </form>

    <ul>
      {#each data.groups as g}
        <li class:selected={selectedGroup?.id === g.id}>
          <button on:click={() => (selectedGroup = g)}>
            {g.name}
          </button>

          <form method="POST" action="?/deleteGroup">
            <input type="hidden" name="id" value={g.id} />
            <button class="danger">✕</button>
          </form>
        </li>
      {/each}
    </ul>
  </aside>

  <!-- SKILLS -->
  <section>
    {#if selectedGroup}
      <SkillList {selectedGroup} allSkills={data.skills} />
    {:else}
      <p>Select a group</p>
    {/if}
  </section>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 2rem;
  }

  aside ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .selected button {
    font-weight: bold;
  }

  .danger {
    color: red;
  }
</style>