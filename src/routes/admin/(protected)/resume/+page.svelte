<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  let uploading = false;
  let uploaded = false;

  async function uploadResume(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    console.log("File selected:", { name: file.name, type: file.type, size: file.size });

    uploading = true;
    uploaded = false;

    try {
      // 1. ask backend for presigned URL via server action (avoids CORS)
      const formData = new FormData();
      formData.append("filename", file.name || "resume.pdf");
      formData.append("contentType", file.type || "application/pdf");
      formData.append("size", (file.size || 0).toString());

      const res = await fetch("?/createUploadUrl", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload URL error:", errorText);
        throw new Error("Failed to get upload URL");
      }

      const result = await res.json();
      console.log("Upload URL response:", result);
      
      let uploadUrl, publicUrl;
      
      if (result.type === 'success' && result.data) {
        // Parse the stringified data
        const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        console.log("Parsed data:", data);
        
        // Backend returns array: [metadata, uploadUrl, publicUrl]
        if (Array.isArray(data)) {
          uploadUrl = data[1];
          publicUrl = data[2];
        } else {
          uploadUrl = data.uploadUrl;
          publicUrl = data.publicUrl;
        }
      } else {
        uploadUrl = result.uploadUrl;
        publicUrl = result.publicUrl;
      }
      
      console.log("Extracted URLs:", { uploadUrl, publicUrl });
      
      if (!uploadUrl || !publicUrl) {
        throw new Error("Invalid upload URLs received");
      }

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
      console.error("Resume upload error:", err);
      alert("Resume upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
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
      Uploaded at: {new Date(data.resume.updatedAt).toLocaleString()}
    </p>

    <a
      href={data.resume.url}
      target="_blank"
      rel="noopener noreferrer"
      class="btn btn-primary"
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