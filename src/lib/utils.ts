


export const formatGuestName = (name: string): string =>
  name
    .trim()
    .toLocaleLowerCase("en-PH")
    .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-PH"));

export const formatDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDay()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
