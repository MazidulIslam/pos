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
        ml: { xs: 0, lg: isExpanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px` },
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
        minHeight: `calc(100vh - var(--header-height))`,
      }}
    >
      {children}
    </Box>
  );
};
