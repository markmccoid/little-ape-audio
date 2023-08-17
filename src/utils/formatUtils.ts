export const formatBytes = (bytes: number) => {
  let finalBytes = "";
  if (bytes >= 1073741824) {
    finalBytes = (bytes / 1073741824).toFixed(2) + " GB";
  } else if (bytes >= 1048576) {
    finalBytes = (bytes / 1048576).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    finalBytes = (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes > 1) {
    finalBytes = bytes + " bytes";
  } else if (bytes == 1) {
    finalBytes = bytes + " byte";
  } else {
    finalBytes = "0 bytes";
  }
  return finalBytes;
};

export const formatSeconds = (
  secondsIn: number,
  type?: "minimal" | "verbose",
  showHours?: boolean
) => {
  type = type || "minimal";
  showHours = showHours ?? true;
  // if (!secondsIn) return 0;
  const d = Number(secondsIn);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  if (type === "minimal") {
    const hours = `${h > 0 ? h + ":" : "00:"}`;
    return `${showHours === true ? hours : ""}${
      m > 0 ? m.toString().padStart(2, "0") + ":" : "00:"
    }${s.toString().padStart(2, "0")}`;
  }

  const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  if (!showHours) {
    return mDisplay + sDisplay;
  }
  return hDisplay + mDisplay + sDisplay;
};

// Takes an End Date and Start Date and return minutes and seconds
// most usefull will be minutesInt and secondsInt as they take
// the total milliseconds and give you the minutes and seconds
// the minutesBetween will be in the form of a float 6.05
// secondsBetween will be the total seconds 365
export const timeBetween = (endDate: Date, startDate: Date) => {
  const msBetween = endDate.valueOf() - startDate.valueOf();
  const secondsBetween = Math.floor(msBetween / 1000);
  const minutesBetween = secondsBetween / 60;
  const secondsLeft = Math.floor(
    (minutesBetween - Math.floor(minutesBetween)) * 60
  );
  return {
    secondsBetween,
    minutesBetween,
    minutesInt: Math.floor(minutesBetween),
    secondsInt: secondsLeft,
  };
};
