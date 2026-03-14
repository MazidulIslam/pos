"use client";

import { Box } from "@mui/material";
import { useSidebar } from "./SidebarContext";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

export const MainContent = ({ children }) => {
  const { isExpanded } = useSidebar();

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        p: 3,
        mt: "var(--header-height)",
        overflowX: "hidden",
        minHeight: `calc(100vh - var(--header-height))`,
      }}
    >
      {children}
    </Box>
  );
};
