import { Box, Title, Text } from "@mantine/core";
import classes from "./HeroHeader.module.scss";
import colors from "../../styles/themeColors.module.scss";

export const HeroHeader = () => {
  return (
    <Box className={classes.content}>
      <Title className={`${classes.title} ${colors.colorTitle}`} order={1} size="h5" mb={"xl"}>
        Build your budget plan
      </Title>

      <Title className={`${classes.subtitle} ${colors.colorTitle}`} order={2} size="h6">
        Setup channels
      </Title>

      <Text className={`${classes.description} ${colors.colorSecondary}`}>
        Setup your added channels by adding baseline budgets out of your total
        budget. See the forecast impact with the help of tips and insights.
      </Text>
    </Box>
  );
};
