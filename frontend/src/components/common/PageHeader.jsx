"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, InputAdornment, CircularProgress } from "@mui/material";
import { Search, Plus } from "lucide-react";

export const PageHeader = ({ 
  title, 
  searchTerm, 
  onSearchChange, 
  addButtonLabel, 
  onAddClick, 
  canCreate = true,
  searchPlaceholder = "Search...",
  extraActions,
  isSearching = false
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce the search change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onSearchChange === "function") {
        onSearchChange(localSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync with prop if changed externally (e.g. cleared)
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        justifyContent: "space-between", 
        alignItems: { xs: "stretch", md: "center" }, 
        gap: 2,
        mb: 4 
      }}
    >
      <Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: "-0.02em",
            color: "text.primary"
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          alignItems: "center", 
          gap: 2 
        }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          sx={{ 
            minWidth: { sm: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "background.paper",
              "& fieldset": {
                borderColor: "var(--border)",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="var(--text-secondary)" />
              </InputAdornment>
            ),
            endAdornment: isSearching && (
              <InputAdornment position="end">
                <CircularProgress size={16} color="inherit" />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
          {extraActions}
          {addButtonLabel && (
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={onAddClick}
              disabled={!canCreate}
              fullWidth
              sx={{
                borderRadius: 3,
                py: 1,
                px: 3,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.25)",
                "&:hover": {
                  boxShadow: "0 12px 20px -4px rgba(79, 70, 229, 0.35)",
                }
              }}
            >
              {addButtonLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
