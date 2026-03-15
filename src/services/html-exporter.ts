/** Block[] → 인라인 스타일 HTML 변환 — 쿠팡/네이버 직접 붙여넣기용 */

import type { Block } from "@/types/blocks";

export function blocksToHtml(blocks: Block[], width: number): string {
  const visibleBlocks = blocks.filter((b) => b.visible);
  const inner = visibleBlocks.map((b) => blockToHtml(b)).join("\n");

  return `<div style="max-width:${width}px;margin:0 auto;font-family:'Pretendard',sans-serif;color:#111827;line-height:1.6">
${inner}
</div>`;
}

function blockToHtml(block: Block): string {
  switch (block.type) {
    case "hero":
      return `<div style="position:relative;width:100%;min-height:300px;background:#f3f4f6;overflow:hidden">
  ${block.imageUrl ? `<img src="${esc(block.imageUrl)}" style="width:100%;display:block" alt="" />` : `<div style="height:300px;background:#e5e7eb"></div>`}
  ${block.overlays.map((o) => `<div style="position:absolute;left:${o.x}%;top:${o.y}%;transform:translate(-50%,-50%);font-size:${o.fontSize}px;color:${o.color};font-weight:${o.fontWeight};text-align:${o.textAlign}">${esc(o.text)}</div>`).join("\n  ")}
</div>`;

    case "selling-point":
      return `<div style="padding:32px 24px">
  ${block.items.map((item) => `<div style="margin-bottom:16px">
    <h3 style="font-size:18px;font-weight:bold;margin:0 0 4px">${esc(item.title)}</h3>
    <p style="font-size:14px;color:#6b7280;margin:0">${esc(item.description)}</p>
  </div>`).join("\n  ")}
</div>`;

    case "image-full":
      return block.imageUrl
        ? `<div><img src="${esc(block.imageUrl)}" style="width:100%;display:block" alt="" /></div>`
        : `<div style="height:200px;background:#f3f4f6"></div>`;

    case "image-grid":
      return `<div style="display:grid;grid-template-columns:repeat(${block.columns},1fr);gap:8px;padding:16px">
  ${block.images.map((img) => `<div>
    ${img.url ? `<img src="${esc(img.url)}" style="width:100%;display:block;border-radius:4px" alt="" />` : `<div style="height:150px;background:#e5e7eb;border-radius:4px"></div>`}
    ${img.caption ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0;text-align:center">${esc(img.caption)}</p>` : ""}
  </div>`).join("\n  ")}
</div>`;

    case "text-block":
      return `<div style="padding:24px;text-align:${block.align}">
  <h2 style="font-size:20px;font-weight:bold;margin:0 0 8px">${esc(block.heading)}</h2>
  <p style="font-size:14px;color:#4b5563;margin:0">${esc(block.body)}</p>
</div>`;

    case "image-text": {
      const imgHtml = block.imageUrl
        ? `<img src="${esc(block.imageUrl)}" style="width:100%;display:block;border-radius:4px" alt="" />`
        : `<div style="height:200px;background:#e5e7eb;border-radius:4px"></div>`;
      const textHtml = `<div style="padding:16px">
    <h3 style="font-size:18px;font-weight:bold;margin:0 0 8px">${esc(block.heading)}</h3>
    <p style="font-size:14px;color:#4b5563;margin:0">${esc(block.body)}</p>
  </div>`;
      const order = block.imagePosition === "right" ? `${textHtml}\n  <div style="flex:1">${imgHtml}</div>` : `<div style="flex:1">${imgHtml}</div>\n  ${textHtml}`;
      return `<div style="display:flex;gap:16px;padding:24px;align-items:center">\n  <div style="flex:1">${order}</div>\n</div>`;
    }

    case "spec-table":
      return `<div style="padding:24px">
  <h3 style="font-size:18px;font-weight:bold;margin:0 0 12px">${esc(block.title)}</h3>
  <table style="width:100%;border-collapse:collapse">
    ${block.rows.map((r) => `<tr>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:30%;font-size:14px">${esc(r.label)}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:14px">${esc(r.value)}</td>
    </tr>`).join("\n    ")}
  </table>
</div>`;

    case "comparison":
      return `<div style="padding:24px">
  <h3 style="font-size:18px;font-weight:bold;margin:0 0 12px;text-align:center">${esc(block.title)}</h3>
  <div style="display:flex;gap:16px">
    <div style="flex:1;text-align:center">
      <p style="font-size:14px;font-weight:600;margin:0 0 8px">${esc(block.before.label)}</p>
      ${block.before.imageUrl ? `<img src="${esc(block.before.imageUrl)}" style="width:100%;border-radius:4px" alt="" />` : `<div style="height:150px;background:#fee2e2;border-radius:4px"></div>`}
    </div>
    <div style="flex:1;text-align:center">
      <p style="font-size:14px;font-weight:600;margin:0 0 8px">${esc(block.after.label)}</p>
      ${block.after.imageUrl ? `<img src="${esc(block.after.imageUrl)}" style="width:100%;border-radius:4px" alt="" />` : `<div style="height:150px;background:#dcfce7;border-radius:4px"></div>`}
    </div>
  </div>
</div>`;

    case "review":
      return `<div style="padding:24px">
  <h3 style="font-size:18px;font-weight:bold;margin:0 0 12px">${esc(block.title)}</h3>
  ${block.reviews.map((r) => `<div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">${esc(r.author)} ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
    <p style="font-size:14px;color:#4b5563;margin:0">${esc(r.text)}</p>
  </div>`).join("\n  ")}
</div>`;

    case "usage-steps":
      return `<div style="padding:24px">
  <h3 style="font-size:18px;font-weight:bold;margin:0 0 16px">${esc(block.title)}</h3>
  <div style="display:flex;gap:16px;flex-wrap:wrap">
    ${block.steps.map((s, i) => `<div style="flex:1;min-width:140px;text-align:center">
      <div style="width:32px;height:32px;border-radius:50%;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-weight:bold">${i + 1}</div>
      ${s.imageUrl ? `<img src="${esc(s.imageUrl)}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin:0 auto 8px;display:block" alt="" />` : ""}
      <p style="font-size:13px;font-weight:600;margin:0 0 4px">${esc(s.label)}</p>
      <p style="font-size:12px;color:#6b7280;margin:0">${esc(s.description)}</p>
    </div>`).join("\n    ")}
  </div>
</div>`;

    case "cta":
      return `<div style="padding:32px 24px;text-align:center;background:${block.bgColor ?? "#f9fafb"}">
  <h3 style="font-size:20px;font-weight:bold;margin:0 0 8px">${esc(block.text)}</h3>
  <p style="font-size:14px;color:#6b7280;margin:0 0 16px">${esc(block.subtext)}</p>
  <a href="${esc(block.buttonUrl)}" style="display:inline-block;padding:12px 32px;background:${block.buttonColor ?? "#4f46e5"};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">${esc(block.buttonLabel)}</a>
</div>`;

    case "divider":
      if (block.style === "dot") {
        return `<div style="text-align:center;padding:${block.height / 2}px 0;color:#d1d5db;letter-spacing:8px">• • •</div>`;
      }
      if (block.style === "space") {
        return `<div style="height:${block.height}px"></div>`;
      }
      return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:${block.height / 2}px 24px" />`;

    case "video":
      return block.videoUrl
        ? `<div style="padding:16px"><video src="${esc(block.videoUrl)}" poster="${esc(block.posterUrl)}" controls style="width:100%;border-radius:8px"></video></div>`
        : "";

    default:
      return "";
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
