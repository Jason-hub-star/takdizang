import { LAZY_FONT_STYLESHEETS } from "@/lib/constants";

const FONT_LINK_PREFIX = "takdi-font-";

export function loadEditorFonts() {
  if (typeof document === "undefined") {
    return;
  }

  for (const href of LAZY_FONT_STYLESHEETS) {
    const id = `${FONT_LINK_PREFIX}${hashHref(href)}`;
    if (document.getElementById(id)) {
      continue;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

function hashHref(href: string) {
  return href.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}
