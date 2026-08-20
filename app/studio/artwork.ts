import type { Direction } from "./types";

export function createFallbackSvg(direction: Direction, brand: string, headline: string) {
  const [dark, accent, light] = direction.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="720" height="960" fill="#eeeae1"/><rect x="22" y="20" width="676" height="70" fill="#faf8f3"/><text x="360" y="66" text-anchor="middle" font-family="Georgia" font-size="34" font-weight="700" fill="#171717">THE DAILY CHRONICLE</text><line x1="22" y1="99" x2="698" y2="99" stroke="#222"/><g fill="#b7b2aa" font-family="Arial" font-size="10"><text x="26" y="118">WEDNESDAY, AUGUST 19, 2026</text><text x="595" y="118">CITY EDITION · ₹12</text></g><g opacity=".4" fill="#85817a"><rect x="24" y="136" width="205" height="8"/><rect x="24" y="153" width="190" height="5"/><rect x="246" y="136" width="205" height="8"/><rect x="468" y="136" width="228" height="8"/></g><rect x="20" y="184" width="680" height="754" rx="2" fill="url(#g)"/><circle cx="560" cy="380" r="210" fill="${accent}" opacity=".32"/><circle cx="525" cy="405" r="132" fill="${light}" opacity=".12"/><g transform="translate(80 300)"><text font-family="Arial" font-size="13" letter-spacing="4" fill="${light}">${brand}</text><text y="80" font-family="Georgia" font-size="58" fill="${light}">${headline}</text><text y="118" font-family="Arial" font-size="16" fill="${light}" opacity=".8">Designed with intention. Made to be remembered.</text></g><g transform="translate(395 475)"><ellipse cx="95" cy="246" rx="130" ry="22" fill="#000" opacity=".22"/><rect x="28" y="38" width="136" height="220" rx="68" fill="${light}" opacity=".92"/><rect x="45" y="70" width="102" height="135" rx="4" fill="${dark}"/><text x="96" y="128" text-anchor="middle" font-family="Georgia" font-size="17" fill="${light}">${brand.split(" ")[0]}</text><text x="96" y="153" text-anchor="middle" font-family="Arial" font-size="9" fill="${accent}">SIGNATURE</text></g><rect x="66" y="852" width="250" height="44" rx="22" fill="${light}"/><text x="191" y="880" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="${dark}">DISCOVER THE COLLECTION</text><g transform="translate(610 840)"><rect width="62" height="62" fill="white"/><path d="M7 7h16v16H7zM39 7h16v16H39zM7 39h16v16H7zM30 30h8v8h-8zM43 34h12v7H43zM29 45h8v10h-8zM43 47h12v8H43z" fill="#111"/></g></svg>`;
}

export function downloadArtworkJpeg(svg: string, onError: (message: string) => void) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1980; canvas.height = 3060;
    const context = canvas.getContext("2d");
    if (!context) { URL.revokeObjectURL(url); onError("Could not create JPG canvas"); return; }
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.filter = "saturate(1.12) contrast(1.06) brightness(1.01)";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.filter = "none"; URL.revokeObjectURL(url);
    canvas.toBlob(result => {
      if (!result) { onError("Could not encode JPG"); return; }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(result); link.download = "pressform-artwork.jpg"; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, "image/jpeg", .95);
  };
  image.onerror = () => { URL.revokeObjectURL(url); onError("Could not render artwork as JPG"); };
  image.src = url;
}
