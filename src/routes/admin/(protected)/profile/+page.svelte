<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { S3_BASE_URL } from '$lib/env';
  export let data: PageData;
  export let form: ActionData;

  let profile = { ...data.profile };
  let uploading = false;

  // Sync profile when data changes (after save)
  $: profile = { ...data.profile };

  // Always construct photoPreview from s3Key when available, with cache busting
  $: photoPreview = profile.s3Key 
    ? `${S3_BASE_URL}/profile/${profile.s3Key}?t=${Date.now()}` 
    : null;

  async function uploadPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;

    try {
      const formData = new FormData();
      formData.append("filename", file.name);
      formData.append("contentType", file.type);
      formData.append("size", file.size.toString());

      const res = await fetch("?/getUploadUrl", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const result = await res.json();
      console.log("Upload URL response:", result);

      if (result.type === 'failure') {
        const errorData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        throw new Error(errorData[1] || errorData.error || "Failed to get upload URL");
      }

      const responseData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      
      let uploadUrl, publicUrl, s3Key;
      
      if (Array.isArray(responseData)) {
        // Backend returns array format: [metadata, uploadUrl, publicUrl]
        uploadUrl = responseData[1];
        publicUrl = responseData[2];
        s3Key = responseData[2]?.split('/').pop() || '';
      } else {
        // Backend returns object format
        uploadUrl = responseData.uploadUrl;
        publicUrl = responseData.publicUrl;
        s3Key = responseData.s3Key;
      }

      if (!uploadUrl) throw new Error("No upload URL received");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      profile.s3Key = s3Key;
      photoPreview = `${S3_BASE_URL}/profile/${s3Key}`;
      input.value = "";
    } catch (error) {
      console.error("Photo upload error:", error);
      alert("Photo upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      uploading = false;
    }
  }
</script>

<h1>Profile</h1>

<form method="POST" action="?/save" on:submit={() => console.log('Saving profile with s3Key:', profile.s3Key)}>
  <label>
    Profile Photo
    <input type="file" accept="image/*" on:change={uploadPhoto} />
    {#if uploading}
      <p class="muted">Uploading photo…</p>
    {/if}
    {#if photoPreview}
      <img src={photoPreview} alt="Profile" class="profile-preview" />
    {/if}
  </label>

  <input type="hidden" name="s3Key" bind:value={profile.s3Key} />

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
  .muted {
    color: #666;
    font-size: 0.9rem;
  }

  .profile-preview {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    margin-top: 0.5rem;
    object-fit: cover;
  }
</style>