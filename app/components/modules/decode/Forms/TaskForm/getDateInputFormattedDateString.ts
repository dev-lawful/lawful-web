export const getDateInputFormattedDateString = (dateString: string) => {
  const dueDate = new Date(dateString);

  const yyyy = dueDate.getFullYear();
  let MM: string | number = dueDate.getMonth() + 1; // Months start at 0!
  let dd: string | number = dueDate.getDate();
  let hh: string | number = dueDate.getHours();
  let mm: string | number = dueDate.getMinutes();

  if (dd < 10) dd = `0${dd}`;
  if (mm < 10) mm = `0${mm}`;
  if (MM < 10) MM = `0${MM}`;
  if (hh < 10) hh = `0${hh}`;

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};
