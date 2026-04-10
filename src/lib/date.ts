const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
});

export function formatDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return dateFormatter.format(parsedDate);
}
