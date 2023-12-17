import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  MantineReactTable,
  MRT_ToggleDensePaddingButton,
  type MRT_ColumnDef,
  type MRT_Row,
  MRT_ToggleFullScreenButton,
  MRT_TableInstance,
  useMantineReactTable,
  MRT_ExpandedState,
  MRT_TableOptions,
} from "mantine-react-table";
import {
  Button,
  Flex,
  Menu,
  MantineProvider,
  Select,
  NumberInput,
  Grid,
  Col,
  Space,
  SegmentedControl,
  Box,
  Title,
  Text,
} from "@mantine/core";
import {
  selectChannels,
  addChannel,
  removeChannel,
  updateChannel,
  updateBudgetBreakdown,
  updateRow,
} from "../../store/budgetSlice";
import { AllocationType, BudgetType, Channel } from "../../types/budgetTypes";
import {
  formatNumberInput,
  parseNumberInput,
} from "../../services/numberFormattingService";
import colors from "../../styles/themeColors.module.scss";

const TabOne = () => {
  const channels: Channel[] = useSelector(selectChannels);
  const dispatch = useDispatch();
  const budgetTypes: BudgetType[] = ["Annually", "Quarterly", "Monthly"];
  const allocationTypes: AllocationType[] = ["Equal", "Manual"];
  const [expandedTemp, setExpandedTemp] = useState<MRT_ExpandedState>({});
  const [expanded, setExpanded] = useState<MRT_ExpandedState>({});

  // Set expanded state when expandedTemp changes
  useEffect(() => {
    if (
      Object.keys(expandedTemp).length !== 0 &&
      JSON.stringify(expandedTemp) !== JSON.stringify(expanded)
    ) {
      setExpanded(expandedTemp);
      setExpandedTemp({});
    } else if (
      Object.keys(expanded).length !== 0 &&
      JSON.stringify(expandedTemp) === JSON.stringify(expanded)
    ) {
      setExpandedTemp({});
      setExpanded({});
    }
  }, [expandedTemp, expanded]);

  // Columns for Mantine React Table
  const columns = useMemo<MRT_ColumnDef<Channel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Channel Name",
      },
    ],
    []
  );

  // Render detail panel for expanded row
  const renderDetailPanel = ({ row }: { row: MRT_Row<Channel> }) => {
    const { id, baseline, frequency, allocation, monthlyBudget } = row.original;

    const isInputDisabled = allocation === "Equal";
    const isFrequencyAndBaselineDisabled = allocation === "Manual";

    return (
      <Box bg={"white"} p={"md"}>
        <Flex
          mih={100}
          gap="xl"
          justify="flex-start"
          align="center"
          direction="row"
          wrap="nowrap"
        >
          <Select
            label="Budget Frequency"
            value={frequency}
            disabled={isFrequencyAndBaselineDisabled}
            onChange={(value) =>
              handleFrequencyChange(row.original.id, value as BudgetType)
            }
            data={budgetTypes}
          />
          <Space w="l" />
          <NumberInput
            label={`Baseline [${frequency}] Budget`}
            value={baseline}
            disabled={isFrequencyAndBaselineDisabled}
            onChange={(value) => handleBaselineChange(id, value || 0)}
            precision={0}
            parser={(value) => parseNumberInput(value)}
            formatter={(value) => formatNumberInput(value)}
            styles={{
              input: {
                color: `${
                  allocation === "Equal"
                    ? colors.primaryColor
                    : colors.secondaryColor
                }`,
              },
            }}
          />
          <Space w="l" />
          <Box sx={{ borderRadius: 20 }}>
            <Text fw={500}>Budget Allocation</Text>
            <Box>
              <SegmentedControl
                data={allocationTypes}
                value={allocation}
                onChange={(value) =>
                  handleAllocationChange(id, value as AllocationType)
                }
              />
            </Box>
            {/* <Input type="test"  value={<NumberFormatter prefix="$ " value={1000000} thousandSeparator />}/> */}
          </Box>
        </Flex>
        <Box bg="#F5F6FA" p="xl">
          <Title order={2} size="h5" mb={8}>
            Budget Breakdown
          </Title>
          <Text size="sm" className={`${colors.colorSecondary}`} mb="xl">
            By default, your budget will be equally divided throughout the year.
            You can manually change the budget allocation, either now or later.
          </Text>

          <Grid>
            {monthlyBudget &&
              monthlyBudget.map((budgetItem, index) => (
                <Col key={index} span={2} xs={6} md={4} lg={2}>
                  <NumberInput
                    label={budgetItem.month}
                    value={budgetItem.budget}
                    // type="number"
                    disabled={isInputDisabled}
                    onChange={(value) =>
                      handleBudgetChange(id, index, value as number)
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    formatter={(value) =>
                      formatNumberInput(value, budgetItem.currency || "$")
                    }
                    styles={{
                      input: {
                        color: `${
                          allocation === "Manual"
                            ? colors.primaryColor
                            : colors.secondaryColor
                        }`,
                      },
                    }}
                  />
                </Col>
              ))}
          </Grid>
        </Box>
      </Box>
    );
  };

  // Save row handler
  const handleSaveRow: MRT_TableOptions<Channel>["onEditingRowSave"] = ({
    exitEditingMode,
    row,
    values,
  }) => {
    if (row.original.id && values.name) {
      dispatch(updateRow({ id: row.original.id, name: values.name }));
    }
    exitEditingMode();
  };

  // Add channel handler
  const handleAddChannel = () => {
    dispatch(addChannel());
  };

  // Handle frequency change
  const handleFrequencyChange = (id: string, value: BudgetType) => {
    dispatch(
      updateChannel({
        id,
        data: { frequency: value },
      })
    );
  };

  // Update baseline budget and recalculate breakdown if necessary
  const handleBaselineChange = (id: string, value: number) => {
    dispatch(
      updateChannel({
        id,
        data: { baseline: value },
      })
    );
  };

  // Handle allocation change
  const handleAllocationChange = (id: string, value: AllocationType) => {
    dispatch(
      updateChannel({
        id,
        data: { allocation: value },
      })
    );
  };

  // Handle budget breakdown change
  const handleBudgetChange = (id: string, index: number, value: number) => {
    dispatch(
      updateBudgetBreakdown({
        rowId: id,
        breakdownIndex: index,
        newValue: value,
      })
    );
  };

  // Mantine React Table setup
  const table = useMantineReactTable({
    columns: columns,
    data: channels,
    renderDetailPanel: ({ row }) => renderDetailPanel({ row: row }),
    enableTableHead: false,
    enableBottomToolbar: false,
    enableRowActions: true,
    enableGlobalFilter: true,
    onEditingRowSave: handleSaveRow,
    state: {
      expanded,
      showGlobalFilter: true,
    },
    onExpandedChange: setExpandedTemp,
    renderRowActionMenuItems: ({ row }: { row: MRT_Row<Channel> }) => (
      <>
        <Menu.Item
          onClick={() => {
            table.setEditingRow(row);
          }}
        >
          Edit
        </Menu.Item>
        <Menu.Item onClick={() => dispatch(removeChannel(row.original.id))}>
          Delete
        </Menu.Item>
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <Box>
        <Button color="teal" onClick={handleAddChannel} variant="filled">
          Add Channel
        </Button>
      </Box>
    ),
    renderToolbarInternalActions: ({
      table,
    }: {
      table: MRT_TableInstance<Channel>;
    }) => (
      <Flex gap="xs" align="center">
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Flex>
    ),
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": {
        mantineTableHeadCellProps: {
          align: "right",
        },
        mantineTableBodyCellProps: {
          align: "right",
        },
      },
    },
  });

  return (
    <div>
      <MantineProvider>
        <MantineReactTable table={table} />
      </MantineProvider>
    </div>
  );
};

export default TabOne;
