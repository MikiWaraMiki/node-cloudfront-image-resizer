const ParseIntSupport = (strNumber: String): number => {
  const num = Number(strNumber);
  if (Number.isNaN(num)) {
    return 0;
  }

  return num;
};

export default ParseIntSupport;
