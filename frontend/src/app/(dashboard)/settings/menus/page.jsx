"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { Add, Edit, Delete, Security } from "@mui/icons-material";

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: "", slug: "", path: "", icon: "", sortOrder: 0, parent_id: "" });
  
  // New Menu Permissions states UI
  const [defaultPerms, setDefaultPerms] = useState({ list: false, view: false, create: false, update: false, delete: false });
  const [customPerms, setCustomPerms] = useState([]);
  const [newCustomPermName, setNewCustomPermName] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/menus", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
      } else {
        showToast(data.message || "Failed to fetch menus", "error");
      }
    } catch (error) {
      console.error("Failed to fetch menus", error);
      showToast("Network error fetching menus", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenUserModal = (menu = null) => {
    if (menu) {
      setFormData({ name: menu.name, slug: menu.slug, path: menu.path, icon: menu.icon || "", sortOrder: menu.sortOrder, parent_id: menu.parent_id || "" });
      setSelectedMenu(menu);
      
      const perms = menu.permissions || [];
      setDefaultPerms({
        list: perms.some(p => p.isDefault && p.action.endsWith('.list')),
        view: perms.some(p => p.isDefault && p.action.endsWith('.view')),
        create: perms.some(p => p.isDefault && p.action.endsWith('.create')),
        update: perms.some(p => p.isDefault && p.action.endsWith('.update')),
        delete: perms.some(p => p.isDefault && p.action.endsWith('.delete'))
      });
      
      const defaultActions = ['.list', '.view', '.create', '.update', '.delete'];
      setCustomPerms(perms.filter(p => !p.isDefault || !defaultActions.some(da => p.action.endsWith(da))));
    } else {
      setFormData({ name: "", slug: "", path: "", icon: "", sortOrder: 0, parent_id: "" });
      setSelectedMenu(null);
      setDefaultPerms({ list: false, view: false, create: false, update: false, delete: false });
      setCustomPerms([]);
    }
    setNewCustomPermName("");
    setOpenUserModal(true);
  };

  const handleAddCustomPermToDraft = () => {
    if (!newCustomPermName) return;
    
    let finalName = newCustomPermName;
    if (formData.name && !finalName.toLowerCase().startsWith(formData.name.toLowerCase())) {
      finalName = `${formData.name} ${newCustomPermName}`;
    }
    
    let baseAction = newCustomPermName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalAction = baseAction;
    if (formData.slug && !finalAction.startsWith(`${formData.slug.toLowerCase()}.`)) {
      finalAction = `${formData.slug}.${baseAction}`;
    }

    setCustomPerms([...customPerms, { name: finalName, action: finalAction }]);
    setNewCustomPermName("");
  };

  const handleSaveMenu = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedMenu ? `http://localhost:5050/api/menus/${selectedMenu.id}` : "http://localhost:5050/api/menus";
      const method = selectedMenu ? "PUT" : "POST";
      
      const permissionsToSave = [];
      const slug = formData.slug || "";
      if (defaultPerms.list) permissionsToSave.push({ name: `${formData.name} List`, action: `${slug}.list`, isDefault: true });
      if (defaultPerms.view) permissionsToSave.push({ name: `${formData.name} View`, action: `${slug}.view`, isDefault: true });
      if (defaultPerms.create) permissionsToSave.push({ name: `${formData.name} Create`, action: `${slug}.create`, isDefault: true });
      if (defaultPerms.update) permissionsToSave.push({ name: `${formData.name} Update`, action: `${slug}.update`, isDefault: true });
      if (defaultPerms.delete) permissionsToSave.push({ name: `${formData.name} Delete`, action: `${slug}.delete`, isDefault: true });
      
      customPerms.forEach(p => permissionsToSave.push({ name: p.name, action: p.action, isDefault: false }));

      const payload = { ...formData, permissions: permissionsToSave };
      if (payload.parent_id === "") payload.parent_id = null;

      const data = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then(res => res.json());
      
      if (data.success) {
        showToast("Menu saved successfully!");
        setOpenUserModal(false);
        fetchMenus();
      } else {
        showToast(data.message || "Failed to save menu", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error saving menu", "error");
    }
  };

  const handleDeleteMenu = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const data = await fetch(`http://localhost:5050/api/menus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json());
      
      if (data.success) {
        showToast("Menu deleted successfully!");
        fetchMenus();
      } else {
        showToast(data.message || "Failed to delete menu", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error deleting menu", "error");
    }
  };



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Menus Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenUserModal()}>
          Add Menu
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Slug</strong></TableCell>
              <TableCell><strong>Route Path</strong></TableCell>
              <TableCell><strong>Icon</strong></TableCell>
              <TableCell><strong>Sorting</strong></TableCell>
              <TableCell><strong>Permissions Bound</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : (
              menus.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.slug}</TableCell>
                <TableCell>{m.path}</TableCell>
                <TableCell>{m.icon}</TableCell>
                <TableCell>{m.sortOrder}</TableCell>
                <TableCell>
                  {m.permissions?.length} Actions
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenUserModal(m)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteMenu(m.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            )))}
            {!loading && menus.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No menus found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu Form Modal */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedMenu ? "Edit Menu" : "Add Menu"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Menu Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField margin="dense" label="Slug (e.g. products)" fullWidth value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
          <TextField margin="dense" label="Route Path (e.g. /products)" fullWidth value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} />
          <TextField margin="dense" label="Icon Name (e.g. Dashboard)" fullWidth value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} helperText="Uses @mui/icons-material. Enter exact name like 'Dashboard' or 'People'" />
          <TextField margin="dense" label="Sort Order" type="number" fullWidth value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} />
          
          <FormControl fullWidth margin="dense">
            <InputLabel id="parent-menu-label">Parent Menu (Optional)</InputLabel>
            <Select
              labelId="parent-menu-label"
              value={formData.parent_id || ""}
              label="Parent Menu (Optional)"
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {menus.filter(m => selectedMenu ? m.id !== selectedMenu.id : true).map(m => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
              <Typography variant="subtitle1" mt={2} fontWeight="bold">Select Default Permissions</Typography>
              <FormGroup row>
                <FormControlLabel control={<Checkbox checked={defaultPerms.list} onChange={(e) => setDefaultPerms({...defaultPerms, list: e.target.checked})} />} label="List" />
                <FormControlLabel control={<Checkbox checked={defaultPerms.view} onChange={(e) => setDefaultPerms({...defaultPerms, view: e.target.checked})} />} label="View" />
                <FormControlLabel control={<Checkbox checked={defaultPerms.create} onChange={(e) => setDefaultPerms({...defaultPerms, create: e.target.checked})} />} label="Create" />
                <FormControlLabel control={<Checkbox checked={defaultPerms.update} onChange={(e) => setDefaultPerms({...defaultPerms, update: e.target.checked})} />} label="Update" />
                <FormControlLabel control={<Checkbox checked={defaultPerms.delete} onChange={(e) => setDefaultPerms({...defaultPerms, delete: e.target.checked})} />} label="Delete" />
              </FormGroup>

              <Typography variant="subtitle1" mt={2} fontWeight="bold">Add Custom Permissions (Optional)</Typography>
              <Box display="flex" gap={1} mb={2}>
                 <TextField size="small" label="Name (e.g. Export)" value={newCustomPermName} onChange={(e) => setNewCustomPermName(e.target.value)} />
                 <Button variant="outlined" onClick={handleAddCustomPermToDraft}>Add</Button>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                {customPerms.map((cp, idx) => (
                  <Chip key={idx} label={`${cp.name} (${cp.action})`} onDelete={() => setCustomPerms(customPerms.filter((_, i) => i !== idx))} />
                ))}
              </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserModal(false)}>Cancel</Button>
          <Button onClick={handleSaveMenu} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
