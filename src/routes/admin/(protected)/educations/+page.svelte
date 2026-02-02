<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  type EducationForm = {
    id: number | null;
    institutionName: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number | "";
    endYear: number | "";
    description: string;
  };

  const emptyForm = (): EducationForm => ({
    id: null,
    institutionName: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    description: "",
  });

  let form: EducationForm = emptyForm();

  function edit(e: any) {
    form = {
      id: e.id,
      institutionName: e.institutionName ?? "",
      degree: e.degree ?? "",
      fieldOfStudy: e.fieldOfStudy ?? "",
      startYear: e.startYear ?? "",
      endYear: e.endYear ?? "",
      description: e.description ?? "",
    };
  }

  function reset() {
    form = emptyForm();
  }

  const DEGREE_OPTIONS = [
    "High School",
    "Diploma",
    "Associate Degree",
    "Bachelor Degree",
    "Master Degree",
    "Doctorate (PhD)",
  ];
</script>

<h1>Educations</h1>

<!-- FORM -->
<section class="editor">
  <form method="POST" action={form.id ? "?/update" : "?/create"}>
    {#if form.id}
      <input type="hidden" name="id" value={form.id} />
    {/if}

    <label>
      Institution
      <input
        name="institutionName"
        bind:value={form.institutionName}
        required
      />
    </label>

    <label>
      Degree
      <select name="degree" bind:value={form.degree} required>
        <option value="" disabled selected> Select degree </option>

        {#each DEGREE_OPTIONS as d}
          <option value={d}>{d}</option>
        {/each}
      </select>
    </label>

    <label>
      Field of Study
      <input name="fieldOfStudy" bind:value={form.fieldOfStudy} />
    </label>

    <label>
      Start Year
      <input type="number" name="startYear" bind:value={form.startYear} />
    </label>

    <label>
      End Year
      <input type="number" name="endYear" bind:value={form.endYear} />
    </label>

    <label>
      Description
      <textarea name="description" bind:value={form.description}></textarea>
    </label>

    <div class="actions">
      <button type="submit">💾 Save</button>
      <button type="button" on:click={reset}>Clear</button>
    </div>
  </form>
</section>

<hr />

<!-- LIST -->
<section class="list">
  {#each data.educations as edu}
    <div class="card">
      <strong>{edu.institutionName}</strong>

      <div class="meta">
        {edu.degree}
        {#if edu.fieldOfStudy}
          • {edu.fieldOfStudy}
        {/if}
      </div>

      <div class="years">
        {edu.startYear} – {edu.endYear ?? "Present"}
      </div>

      {#if edu.description}
        <p>{edu.description}</p>
      {/if}

      <div class="buttons">
        <button on:click={() => edit(edu)}>Edit</button>

        <form
          method="POST"
          action="?/delete"
          on:submit={() => confirm("Delete this education?")}
        >
          <input type="hidden" name="id" value={edu.id} />
          <button class="danger">Delete</button>
        </form>
      </div>
    </div>
  {/each}
</section>

<style>
  h1 {
    margin-bottom: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  textarea {
    resize: vertical;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .list {
    margin-top: 1rem;
  }

  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .meta {
    font-size: 0.9rem;
    color: #555;
  }

  .years {
    font-size: 0.85rem;
    color: #777;
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
