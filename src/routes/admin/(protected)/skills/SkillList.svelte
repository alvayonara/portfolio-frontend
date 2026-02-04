<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  export let selectedGroup: any;
  export let allSkills: any[] = [];
  
  let skills: any[] = [];
  let editingId: number | null = null;
  let editName = "";

  $: skills = allSkills.filter(s => s.skillGroupId === selectedGroup.id);

  function startEdit(skill: any) {
    editingId = skill.id;
    editName = skill.name;
  }

  function cancelEdit() {
    editingId = null;
    editName = "";
  }
</script>

<h3>{selectedGroup.name}</h3>

<form 
  method="POST" 
  action="?/createSkill"
  use:enhance={() => {
    return async ({ update }) => {
      await update();
      await invalidateAll();
    };
  }}
>
  <input type="hidden" name="skillGroupId" value={selectedGroup.id} />
  <input name="name" placeholder="New skill" required />
  <button>Add</button>
</form>

<ul>
  {#each skills as s}
    <li>
      {#if editingId === s.id}
        <form 
          method="POST" 
          action="?/updateSkill"
          use:enhance={() => {
            return async ({ update }) => {
              await update();
              await invalidateAll();
              cancelEdit();
            };
          }}
        >
          <input type="hidden" name="id" value={s.id} />
          <input type="hidden" name="skillGroupId" value={selectedGroup.id} />
          <input name="name" bind:value={editName} required />
          <button>Save</button>
          <button type="button" on:click={cancelEdit}>Cancel</button>
        </form>
      {:else}
        <span>{s.name}</span>
        <div class="actions">
          <button on:click={() => startEdit(s)}>Edit</button>
          <form 
            method="POST" 
            action="?/deleteSkill"
            use:enhance={() => {
              return async ({ update }) => {
                await update();
                await invalidateAll();
              };
            }}
          >
            <input type="hidden" name="id" value={s.id} />
            <button class="danger">✕</button>
          </form>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .danger {
    color: red;
  }

  form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  li form {
    margin: 0;
  }
</style>