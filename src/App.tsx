import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { TabOne, TabTwo } from "./pages";
import { Box, Tabs, Container } from "@mantine/core";
import { HeroHeader } from "./components/HeroHeader/HeroHeader";

const App = () => {
  return (
    <Container className="container" p={"5rem"}>
      <Box mb={"3rem"}>
        <HeroHeader />
      </Box>
      <Box>
        <Router>
          <Tabs defaultValue="gallery">
            <Tabs.List mb={"xl"}>
              <Link to={"/TabOne"}>
                <Tabs.Tab value="tab-one">Tab1</Tabs.Tab>
              </Link>
              <Link to={"/TabTwo"}>
                <Tabs.Tab value="tab-two">Tab2</Tabs.Tab>
              </Link>
            </Tabs.List>

            <Routes>
              <Route path="" element={<TabOne />} />
              <Route path="TabOne" element={<TabOne />} />
              <Route path="TabTwo" element={<TabTwo />} />
            </Routes>
          </Tabs>
        </Router>
      </Box>
    </Container>
  );
};

export default App;
