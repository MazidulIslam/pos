"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";

/**
 * A reusable confirmation dialog component using MUI.
 * 
 * @param {boolean} open - Whether the dialog is visible.
 * @param {Function} onClose - Called when the dialog is closed without confirming.
 * @param {Function} onConfirm - Called when the user confirms the action.
 * @param {string} title - The title of the dialog.
 * @param {string} message - The message body of the dialog.
 * @param {string} confirmText - Label for the confirm button.
 * @param {string} cancelText - Label for the cancel button.
 * @param {string} severity - "error" (default), "warning", "info".
 */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action may be irreversible.",
  confirmText = "Delete",
  cancelText = "Cancel",
  severity = "error",
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "warning":
        return "warning.main";
      case "info":
        return "info.main";
      case "error":
      default:
        return "error.main";
    }
  };

  const getConfirmButtonColor = () => {
    return severity === "info" ? "primary" : severity;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: `${getSeverityColor()}15`,
              color: getSeverityColor(),
            }}
          >
            <AlertTriangle size={22} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="confirm-dialog-description"
          sx={{ color: "text.primary", mt: 1 }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={getConfirmButtonColor()}
          autoFocus
          sx={{
            fontWeight: 700,
            px: 3,
            borderRadius: 2,
            boxShadow: `0 8px 16px -4px ${severity === "error" ? "rgba(211, 47, 47, 0.4)" : "rgba(0, 0, 0, 0.1)"}`,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
