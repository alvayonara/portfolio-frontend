<script lang="ts">
  import type { PageData, ActionData } from './$types';
  export let data: PageData;
  export let form: ActionData;

  let profile = { ...data.profile };
</script>

<h1>Profile</h1>

<form method="POST" action="?/save">
  <label>
    Full Name
    <input name="fullName" bind:value={profile.fullName} />
  </label>

  <label>
    Headline
    <input name="headline" bind:value={profile.headline} />
  </label>

  <label>
    Summary
    <textarea name="summary" rows="4" bind:value={profile.summary}></textarea>
  </label>

  <label>
    Location
    <input name="location" bind:value={profile.location} />
  </label>

  <label>
    Email
    <input type="email" name="email" bind:value={profile.email} />
  </label>

  <label>
    GitHub URL
    <input type="url" name="githubUrl" bind:value={profile.githubUrl} />
  </label>

  <label>
    LinkedIn URL
    <input type="url" name="linkedinUrl" bind:value={profile.linkedinUrl} />
  </label>

  <button type="submit">Save</button>
</form>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}

{#if form?.success}
  <p class="success">Saved successfully</p>
{/if}

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

  button {
    width: fit-content;
    padding: 0.5rem 1.25rem;
  }

  .error {
    color: red;
  }

  .success {
    color: green;
  }
</style>