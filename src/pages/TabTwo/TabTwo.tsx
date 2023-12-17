import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { selectChannels } from "../../store/budgetSlice";
import { Channel } from "../../types/budgetTypes";
import { Box } from "@mantine/core";

const TabTwo = () => {
  const channels: Channel[] = useSelector(selectChannels);

  // Create the dynamic columns for the months
  const monthColumns = useMemo(() => {
    const sampleChannel = channels[0];
    if (!sampleChannel) return [];
    const currency = sampleChannel.monthlyBudget?.[0]?.currency ?? "$";

    return (sampleChannel.monthlyBudget ?? []).map((budgetItem) => ({
      accessorFn: (row: Channel) =>
        row.monthlyBudget?.find((item) => item.month === budgetItem.month)
          ?.budget ?? 0,
      header: budgetItem.month,
      Cell: (renderedCellValue: { cell: MRT_Cell<Channel> }) => {
        const budgetValue = renderedCellValue.cell.getValue();
        const displayValue =
          typeof budgetValue === "number"
            ? budgetValue.toFixed(0)
            : budgetValue;
        return (
          <Box>
            {currency}
            {displayValue as React.ReactNode}
          </Box>
        );
      },
    }));
  }, [channels]);

  // Combine the static and dynamic columns
  const columns: MRT_ColumnDef<Channel>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Channel Name",
      },
      ...monthColumns,
    ],
    [monthColumns]
  );

  return (
    <div>
      <MantineReactTable<Channel> columns={columns} data={channels} />
    </div>
  );
};

export default TabTwo;
