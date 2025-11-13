import * as moment from "moment";

export const viewFullDateTime = (published) => {
  if (!published) return "";

  return replaceMonth(moment(published).format("DD.MM.YYYY, HH:mm"));
};

export const viewMonthYear = (published, short = false) => {
  if (!published) return "";

  return replaceMonth(moment(published).format("MMM YYYY"), short);
};

export const replaceMonth = (dateString, short = false) => {
  if (!dateString) return "";

  const localeMonths = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  const enMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const indexedMonths = enMonths.reduce((acc, month, i) => ({ ...acc, [month.slice(0, 3).toLowerCase()]: i }), {});

  return dateString.replace(new RegExp([...enMonths, ...enMonths.map((month) => month.slice(0, 3))].join("|"), "gi"), (key) => {
    return localeMonths[indexedMonths[key.toLowerCase()]]?.slice(0, short ? 3 : undefined) || key.slice(0, short ? 3 : undefined);
  });
};
