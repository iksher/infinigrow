export const parseNumberInput = (value: string): string =>
  value.replace(/\$\s?|(,*)/g, "");

export const formatNumberInput = (
  value: string,
  currency: string = ""
): string =>
  !Number.isNaN(parseFloat(value))
    ? `${currency} ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    : `${currency}`;
