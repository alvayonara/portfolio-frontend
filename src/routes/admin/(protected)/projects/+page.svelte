<script lang="ts">
  import type { PageData } from "./$types";
  import { backendFetch } from "$lib/api/backend";
  import { page } from "$app/stores";
  import { S3_BASE_URL } from '$lib/env';

  export let data: PageData;

  $: {
    const editId = $page.url.searchParams.get("edit");
    if (editId) {
      const project = data.projects.find((p: { id: number; }) => p.id === Number(editId));
      if (project) {
        edit(project);
      }
    }
  }

  type ProjectForm = {
    id: number | null;
    title: string;
    description: string;
    techStack: string;
    repoUrl: string;
    s3Key: string | null;
    thumbnailS3Key: string | null;
  };

  const emptyForm = (): ProjectForm => ({
    id: null,
    title: "",
    description: "",
    techStack: "",
    repoUrl: "",
    s3Key: null,
    thumbnailS3Key: null,
  });

  let form: ProjectForm = emptyForm();
  let currentProject: any = null;

  let imagePreview: string | null = null;
  let thumbnailPreview: string | null = null;
  let uploading = false;
  let uploadingThumbnail = false;

  function edit(p: any) {
    currentProject = p;
    form = {
      id: p.id,
      title: p.title ?? "",
      description: p.description ?? "",
      techStack: p.techStack ?? "",
      repoUrl: p.repoUrl ?? "",
      s3Key: p.s3Key ?? null,
      thumbnailS3Key: p.thumbnailS3Key ?? null,
    };

    imagePreview = p.s3Key
      ? `${S3_BASE_URL}/${p.s3Key}`
      : null;

    thumbnailPreview = p.thumbnailS3Key
      ? `${S3_BASE_URL}/${p.thumbnailS3Key}`
      : null;
  }

  function reset() {
    form = emptyForm();
    currentProject = null;
    imagePreview = null;
    thumbnailPreview = null;
  }

  async function uploadImage(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !form.id) return;

    uploading = true;

    try {
      // Get upload URL via server action
      const formData = new FormData();
      formData.append("id", form.id.toString());
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

      // Handle failure response
      if (result.type === 'failure') {
        const errorData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        console.error("Backend error:", errorData);
        throw new Error(errorData[1] || errorData.error || "Failed to get upload URL");
      }

      let uploadUrl, publicUrl, s3Key;
      
      if (result.type === 'success' && result.data) {
        // Parse stringified data if needed
        const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        
        if (Array.isArray(data)) {
          uploadUrl = data[1];
          publicUrl = data[2];
          s3Key = data[0]?.s3Key || data[2]?.split('/').pop();
        } else {
          uploadUrl = data.uploadUrl;
          publicUrl = data.publicUrl;
          s3Key = data.s3Key;
        }
      } else {
        uploadUrl = result.uploadUrl;
        publicUrl = result.publicUrl;
        s3Key = result.s3Key;
      }

      if (!uploadUrl) throw new Error("No upload URL received");

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      form.s3Key = s3Key;
      imagePreview = publicUrl;
      input.value = "";
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Image upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      uploading = false;
    }
  }

  async function uploadThumbnail(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !form.id) return;

    uploadingThumbnail = true;

    try {
      const formData = new FormData();
      formData.append("id", form.id.toString());
      formData.append("filename", file.name);
      formData.append("contentType", file.type);
      formData.append("size", file.size.toString());

      const res = await fetch("?/getThumbnailUploadUrl", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to get thumbnail upload URL");

      const result = await res.json();
      console.log("Thumbnail upload URL response:", result);

      if (result.type === 'failure') {
        const errorData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        console.error("Backend error:", errorData);
        throw new Error(errorData[1] || errorData.error || "Failed to get thumbnail upload URL");
      }

      let uploadUrl, publicUrl, s3Key;
      
      if (result.type === 'success' && result.data) {
        const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        
        if (Array.isArray(data)) {
          uploadUrl = data[1];
          publicUrl = data[2];
          s3Key = data[0]?.s3Key || data[2]?.split('/').pop();
        } else {
          uploadUrl = data.uploadUrl;
          publicUrl = data.publicUrl;
          s3Key = data.s3Key;
        }
      } else {
        uploadUrl = result.uploadUrl;
        publicUrl = result.publicUrl;
        s3Key = result.s3Key;
      }

      if (!uploadUrl) throw new Error("No upload URL received");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Thumbnail upload failed");

      form.thumbnailS3Key = s3Key;
      thumbnailPreview = publicUrl;
      input.value = "";
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      alert("Thumbnail upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      uploadingThumbnail = false;
    }
  }
</script>

<h1>Projects</h1>

<!-- CREATE DRAFT -->
<form method="POST" action="?/createDraft">
  <button class="primary" type="submit">➕ New Project</button>
</form>

<!-- EDITOR -->
{#if form.id}
  <section class="editor">
    <h2>Edit Project</h2>

    <form method="POST" action="?/update">
      <input type="hidden" name="id" value={form.id} />

      <label>
        Title
        <input name="title" bind:value={form.title} />
      </label>

      <label>
        Description
        <textarea name="description" bind:value={form.description} />
      </label>

      <label>
        Tech Stack
        <input name="techStack" bind:value={form.techStack} />
      </label>

      <label>
        Repo URL
        <input name="repoUrl" bind:value={form.repoUrl} />
      </label>

      <label>
        Thumbnail (for project listing)
        <input type="file" accept="image/*" on:change={uploadThumbnail} />
      </label>

      {#if uploadingThumbnail}
        <p class="muted">Uploading thumbnail…</p>
      {/if}

      {#if thumbnailPreview}
        <img class="preview" src={thumbnailPreview} alt="Thumbnail Preview" />
      {/if}

      <label>
        Project Detail Image (shown when project is clicked)
        <input type="file" accept="image/*" on:change={uploadImage} />
      </label>

      {#if uploading}
        <p class="muted">Uploading image…</p>
      {/if}

      {#if imagePreview}
        <img class="preview" src={imagePreview} alt="Detail Image Preview" />
      {/if}

      <div class="actions">
        <button class="primary" type="submit">💾 Save</button>
        <button type="button" on:click={reset}>Cancel</button>
      </div>
    </form>

    <!-- SECONDARY ACTIONS (NOT NESTED) -->
    <div class="actions secondary">
      <form method="POST" action="?/togglePublish">
        <input type="hidden" name="id" value={form.id} />
        <input
          type="hidden"
          name="publishAction"
          value={currentProject?.published ? "unpublish" : "publish"}
        />
        <button type="submit">
          {currentProject?.published ? "Unpublish" : "Publish"}
        </button>
      </form>

      <form
        method="POST"
        action="?/delete"
        on:submit={() => confirm("Delete this project?")}
      >
        <input type="hidden" name="id" value={form.id} />
        <button class="danger">Delete</button>
      </form>
    </div>
  </section>
{/if}

<hr />

<!-- PROJECT LIST -->
<section class="list">
  {#each data.projects as p}
    <div class="card">
      <strong>{p.title || "(Untitled draft)"}</strong>

      {#if p.published}
        <span class="badge published">Published</span>
      {:else}
        <span class="badge draft">Draft</span>
      {/if}

      <div class="images">
        {#if p.thumbnailS3Key}
          <div class="image-item">
            <label>Thumbnail</label>
            <img
              class="thumb"
              src={`${S3_BASE_URL}/${p.thumbnailS3Key}`}
              alt={p.title}
            />
          </div>
        {/if}
        
        {#if p.s3Key}
          <div class="image-item">
            <label>Detail Image</label>
            <img
              class="thumb"
              src={`${S3_BASE_URL}/${p.s3Key}`}
              alt={p.title}
            />
          </div>
        {/if}
      </div>

      <p>{p.description}</p>

      <button on:click={() => edit(p)}>Edit</button>
    </div>
  {/each}
</section>

<style>
  h1 {
    margin-bottom: 1rem;
  }

  .editor {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-top: 1rem;
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

  .secondary {
    margin-top: 0.5rem;
  }

  .primary {
    background: #2563eb;
    color: white;
  }

  .danger {
    color: red;
  }

  .preview {
    max-width: 300px;
    margin-top: 0.5rem;
    border-radius: 6px;
  }

  .thumb {
    max-width: 160px;
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  .images {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .image-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .image-item label {
    font-size: 0.75rem;
    color: #666;
    font-weight: 600;
  }

  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .badge {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }

  .published {
    background: #d1fae5;
    color: #065f46;
  }

  .draft {
    background: #fee2e2;
    color: #991b1b;
  }

  .muted {
    color: #666;
  }
</style>
