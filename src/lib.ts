export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const readingTime = (text: string) =>
  Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
