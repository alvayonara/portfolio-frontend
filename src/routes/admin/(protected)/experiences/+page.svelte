<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;

  let form = {
    id: null,
    company: "",
    title: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
  };

  function edit(exp: any) {
    form = {
      id: exp.id,
      company: exp.company,
      title: exp.title,
      location: exp.location,
      description: exp.description,
      startDate: exp.startDate ?? "",
      endDate: exp.endDate ?? "",
    };
  }

  function reset() {
    form = {
      id: null,
      company: "",
      title: "",
      location: "",
      description: "",
      startDate: "",
      endDate: "",
    };
  }
</script>

<h1>Experience</h1>

<!-- FORM -->
<form method="POST" action={form.id ? "?/update" : "?/create"}>
  {#if form.id}
    <input type="hidden" name="update" />
    <input type="hidden" name="id" value={form.id} />
  {:else}
    <input type="hidden" name="create" />
  {/if}

  <label>
    Company
    <input name="company" bind:value={form.company} required />
  </label>

  <label>
    Title
    <input name="title" bind:value={form.title} required />
  </label>

  <label>
    Location
    <input name="location" bind:value={form.location} />
  </label>

  <label>
    Start Date
    <input type="date" name="startDate" bind:value={form.startDate} required />
  </label>

  <label>
    End Date
    <input type="date" name="endDate" bind:value={form.endDate} />
  </label>

  <label>
    Description
    <textarea name="description" rows="5" bind:value={form.description}>
    </textarea>
  </label>

  <div class="actions">
    <button type="submit">
      {form.id ? "Update" : "Create"}
    </button>
    <button type="button" on:click={reset}>Clear</button>
  </div>
</form>

<!-- LIST -->
<hr />

{#each data.experiences as exp}
  <div class="card">
    <strong>{exp.title}</strong> — {exp.company}
    <div class="meta">
      {exp.startDate} → {exp.endDate ?? "Present"}
    </div>

    <div class="buttons">
      <button on:click={() => edit(exp)}>Edit</button>

      <form
        method="POST"
        style="display:inline"
        action="?/delete"
        on:submit={(e) => {
          if (!confirm("Delete this experience?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={exp.id} />
        <button type="submit" class="danger">Delete</button>
      </form>
    </div>
  </div>
{/each}

<style>
  form {
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  textarea {
    resize: vertical;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .meta {
    font-size: 0.9rem;
    color: #666;
  }

  .buttons {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  .danger {
    color: red;
  }
</style>
