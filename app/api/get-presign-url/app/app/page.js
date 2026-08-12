"use client";
import { useState } from "react";

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. 请求后端获取预签名上传地址
      const res = await fetch("/api/get-presign-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { uploadUrl, key } = await res.json();

      // 2. 直接把图片上传到 R2
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setResult({ key, success: true });
    } catch (err) {
      setResult({ error: err.message, success: false });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>衣橱图片上传测试</h1>
      <p>选择一张图片，测试上传到 Cloudflare R2</p>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>上传中...</p>}
      {result && result.success && (
        <div style={{ marginTop: 20, padding: 16, background: "#f0f9eb", borderRadius: 8 }}>
          <p>✅ 上传成功！</p>
          <p>文件路径：<code>{result.key}</code></p>
        </div>
      )}
      {result && !result.success && (
        <div style={{ marginTop: 20, padding: 16, background: "#fef0f0", borderRadius: 8 }}>
          <p>❌ 上传失败：{result.error}</p>
        </div>
      )}
    </div>
  );
}
