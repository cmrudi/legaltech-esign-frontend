import React, { useEffect } from "react";
import { navigate } from "@reach/router";
import { useDispatch } from "react-redux";
import SignList from "./Lists/SignList";
import SignedList from "./Lists/SignedList";
import { resetDocToView } from "./ViewDocument/ViewDocumentSlice";
import { resetDocToSign } from "./SignDocument/SignDocumentSlice";
import { Box, Button, Container, Heading, Text, Tabs } from "gestalt";
import "gestalt/dist/gestalt.css";

const TABS = [
  { text: "My Documents" },
  { text: "Need Approval" },
  { text: "Need Signature" },
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetDocToView());
    dispatch(resetDocToSign());
  }, [dispatch]);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const handleChange = ({ activeTabIndex, event }) => {
    event.preventDefault();
    setActiveIndex(activeTabIndex);
  };

  const getContent = () => {
    if (activeIndex === 0) return <SignedList />;
    if (activeIndex === 1) return <SignedList />;
    if (activeIndex === 2) return <SignList />;
  };

  return (
    <Box paddingX={12}>
      <Box paddingX={12}>
        <Box paddingX={3} paddingY={3}>
          <Text size="lg" weight="bold">
            Welcome, John!
          </Text>
          <Heading size="lg">Dashboard</Heading>
        </Box>

        <Box
          padding={3}
          color="white"
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="between"
        >
          <div>
            <Box>
              <Box overflow="auto" borderStyle="lg" padding={3}>
                <Tabs
                  activeTabIndex={activeIndex}
                  onChange={handleChange}
                  size={"lg"}
                  tabs={TABS}
                />
              </Box>
            </Box>
          </div>
          <div>
            <Button
              onClick={(event) => {
                navigate(`/assignUsers`);
              }}
              text="+ Create document"
              color="blue"
              inline
              size="lg"
            />
          </div>
        </Box>

        <Box
          marginTop={6}
          padding={3}
          color="white"
          display="flex"
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          {getContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
