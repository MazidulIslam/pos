"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, InputAdornment, CircularProgress, Stack, Avatar } from "@mui/material";
import { Search, Plus } from "lucide-react";

const PageHeader = ({ 
  title, 
  subtitle,
  icon,
  searchTerm, 
  onSearchChange, 
  addButtonLabel, 
  onAddClick, 
  canCreate = true,
  searchPlaceholder = "Search...",
  extraActions,
  isSearching = false
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || "");

  // Debounce the search change
  useEffect(() => {
    if (onSearchChange) {
      const timer = setTimeout(() => {
        onSearchChange(localSearch);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localSearch, onSearchChange]);

  // Sync with prop if changed externally
  useEffect(() => {
    setLocalSearch(searchTerm || "");
  }, [searchTerm]);

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        justifyContent: "space-between", 
        alignItems: { xs: "stretch", md: "center" }, 
        gap: 3,
        mb: 4 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        {icon && (
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(79,70,229,0.1)', 
              color: 'primary.main',
              width: 52,
              height: 52,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(79,70,229,0.08)'
            }}
          >
            {icon}
          </Avatar>
        )}
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: "-0.03em",
              color: "text.primary",
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          alignItems: "center", 
          gap: 2 
        }}
      >
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            sx={{ 
              minWidth: { sm: 320 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "white",
                "& fieldset": {
                  borderColor: "rgba(0,0,0,0.08)",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#64748b" />
                </InputAdornment>
              ),
              endAdornment: isSearching && (
                <InputAdornment position="end">
                  <CircularProgress size={16} color="inherit" />
                </InputAdornment>
              )
            }}
          />
        )}

        <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
          {extraActions}
          {addButtonLabel && (
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={onAddClick}
              disabled={!canCreate}
              fullWidth
              sx={{
                borderRadius: 2.5,
                py: 1.25,
                px: 3,
                fontWeight: 700,
                textTransform: "none",
                fontSize: 14,
                boxShadow: "0 8px 20px -4px rgba(79, 70, 229, 0.28)",
                "&:hover": {
                  boxShadow: "0 12px 24px -4px rgba(79, 70, 229, 0.38)",
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

export default PageHeader;
