// budgetSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import {
  BudgetType,
  Channel,
  MonthlyBudget,
  Months,
} from "../types/budgetTypes";

export interface BudgetState {
  channels: Array<Channel>;
}

const months: Months[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const initialState: BudgetState = {
  channels: [],
};

const getMonthlyBudgetBreakdown = (
  type: BudgetType,
  totalBudget: number
): MonthlyBudget[] => {
  let monthlyBudget: MonthlyBudget[] = [];

  switch (type) {
    case "Annually":
      const monthlyAmount = totalBudget / 12;
      monthlyBudget = months.map((month) => ({
        month,
        budget: monthlyAmount,
      }));
      break;
    case "Quarterly":
      const quarterlyAmount = totalBudget / 4;
      monthlyBudget = months.map((month, index) => ({
        month,
        budget: index % 3 === 0 ? quarterlyAmount : 0,
      }));
      break;
    case "Monthly":
      monthlyBudget = months.map((month) => ({ month, budget: totalBudget }));
      break;
    default:
      monthlyBudget = months.map((month) => ({ month, budget: 0 }));
  }
  return monthlyBudget;
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    addChannel: (state) => {
      state.channels.push({
        id: `channel-${state.channels.length + 1}`,
        name: "New Channel",
        baseline: 0,
        frequency: "Annually",
        allocation: "Equal",
        monthlyBudget: months.map((month) => ({
          month,
          budget: 0,
          currency: "$",
        })),
      });
    },
    removeChannel: (state, action: PayloadAction<string>) => {
      state.channels = state.channels.filter(
        (channel) => channel.id !== action.payload
      );
    },
    updateRow: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const { id, name } = action.payload;
      const channelIndex = state.channels.findIndex(
        (channel) => channel.id === id
      );
      if (channelIndex !== -1) {
        state.channels[channelIndex].name = name;
      }
    },
    updateChannel: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Channel> }>
    ) => {
      const { id, data } = action.payload;
      const channelIndex = state.channels.findIndex(
        (channel) => channel.id === id
      );

      if (channelIndex !== -1) {
        const channel = state.channels[channelIndex];

        const isFrequencyChanged =
          data.frequency && data.frequency !== channel.frequency;
        const isBaselineChanged =
          data.baseline !== undefined && data.baseline !== channel.baseline;
        const isAllocationChanged =
          data.allocation && data.allocation !== channel.allocation;

        let newMonthlyBudget = channel.monthlyBudget;

        // If allocation type changes to "Equal" or frequency/baseline changes
        if (
          (isAllocationChanged && data.allocation === "Equal") ||
          isFrequencyChanged ||
          isBaselineChanged
        ) {
          // Use the new frequency or fallback to the current one
          const newFrequency = data.frequency || channel.frequency;
          // Use the new baseline or fallback to the current one
          const newBaseline =
            data.baseline !== undefined ? data.baseline : channel.baseline;
          // Recalculate monthly budget
          newMonthlyBudget = getMonthlyBudgetBreakdown(
            newFrequency,
            newBaseline
          );
        }

        // Update the channel with new data and recalculated monthly budget
        state.channels[channelIndex] = {
          ...channel,
          ...data,
          monthlyBudget: newMonthlyBudget,
        };
      }
    },
    updateBudgetBreakdown: (
      state,
      action: PayloadAction<{
        rowId: string;
        breakdownIndex: number;
        newValue: number;
      }>
    ) => {
      const { rowId, breakdownIndex, newValue } = action.payload;
      const channelIndex = state.channels.findIndex(
        (channel) => channel.id === rowId
      );

      if (channelIndex !== -1) {
        const channel = state.channels[channelIndex];
        const monthlyBudget = channel.monthlyBudget ?? [];

        // Check if index is valid
        if (breakdownIndex >= 0 && breakdownIndex < monthlyBudget.length) {
          // Update the specific budget item
          const updatedBudgetItem = {
            ...monthlyBudget[breakdownIndex],
            budget: newValue,
          };

          // Update the monthly budget array
          const newMonthlyBudget = [
            ...monthlyBudget.slice(0, breakdownIndex),
            updatedBudgetItem,
            ...monthlyBudget.slice(breakdownIndex + 1),
          ];

          // Recalculate the baseline budget if necessary
          const totalBaseline = newMonthlyBudget.reduce(
            (sum, item) => sum + item.budget,
            0
          );

          // Update the channel with new monthly budget and potentially new baseline
          state.channels[channelIndex] = {
            ...channel,
            monthlyBudget: newMonthlyBudget,
            baseline: totalBaseline, // Update this only if your logic requires
          };
        }
      }
    },
  },
});

export const {
  addChannel,
  removeChannel,
  updateChannel,
  updateBudgetBreakdown,
  updateRow,
} = budgetSlice.actions;

export const selectChannels = (state: RootState) => state.budget.channels;

export default budgetSlice.reducer;
