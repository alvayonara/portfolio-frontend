<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  let uploading = false;
  let uploaded = false;

  async function uploadResume(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    uploading = true;
    uploaded = false;

    try {
      // 1. ask backend for presigned URL
      const formData = new FormData();
      formData.append("filename", file.name);
      formData.append("contentType", file.type);
      formData.append("size", file.size.toString());

      const res = await fetch("?/createUploadUrl", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, publicUrl } = await res.json();

      // 2. upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      uploaded = true;

      // reload page to refresh resume info
      location.reload();
    } catch (err) {
      alert("Resume upload failed");
    } finally {
      uploading = false;
    }
  }
</script>

<h1>Resume</h1>

<section class="box">
  <h3>Current Resume</h3>

  {#if data.resume}
    <p>
      <strong>{data.resume.originalFilename}</strong><br />
      Uploaded at: {new Date(data.resume.uploadedAt).toLocaleString()}
    </p>

    <a
      href={data.resume.publicUrl}
      target="_blank"
      rel="noopener"
      class="link"
    >
      📄 Download Resume
    </a>
  {:else}
    <p>No resume uploaded yet.</p>
  {/if}
</section>

<section class="box">
  <h3>Upload New Resume (PDF)</h3>

  <input
    type="file"
    accept="application/pdf"
    on:change={uploadResume}
  />

  {#if uploading}
    <p class="muted">Uploading…</p>
  {/if}

  {#if uploaded}
    <p class="success">Resume uploaded successfully</p>
  {/if}
</section>

<style>
  .box {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .link {
    display: inline-block;
    margin-top: 0.5rem;
  }

  .muted {
    color: #666;
  }

  .success {
    color: green;
  }
</style>