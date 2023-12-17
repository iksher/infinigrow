export type BudgetType = "Annually" | "Quarterly" | "Monthly";
export type AllocationType = "Equal" | "Manual";
export type Months =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export interface MonthlyBudget {
  month: Months;
  budget: number;
  currency?: "$" | "£" | "€";
}

export interface Channel {
  id: string;
  name: string;
  baseline: number;
  frequency: BudgetType;
  allocation: AllocationType;
  monthlyBudget?: MonthlyBudget[];
}
