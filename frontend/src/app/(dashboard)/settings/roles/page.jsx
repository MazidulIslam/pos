"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Checkbox, FormControlLabel, FormGroup, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { Add, Edit, Delete, Security, ExpandMore } from "@mui/icons-material";

const MenuNode = ({ menu, selectedPerms, handleTogglePerm, handleToggleMenuAll }) => {
  const getAllPermIds = (node) => {
    let ids = (node.permissions || []).map(p => p.id);
    (node.children || []).forEach(child => {
      ids = ids.concat(getAllPermIds(child));
    });
    return ids;
  };
  
  const allPermIds = getAllPermIds(menu);
  const checkedCount = allPermIds.filter(id => selectedPerms[id]).length;
  const isAllChecked = allPermIds.length > 0 && checkedCount === allPermIds.length;
  const isIndeterminate = checkedCount > 0 && checkedCount < allPermIds.length;

  return (
    <Accordion defaultExpanded sx={{ ml: menu.parent_id ? 3 : 0, mt: 1, boxShadow: menu.parent_id ? 'none' : 1, border: menu.parent_id ? '1px solid #eee' : 'none' }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <FormControlLabel
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          control={
            <Checkbox
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={(e) => handleToggleMenuAll(allPermIds, e.target.checked)}
            />
          }
          label={<Typography fontWeight="medium">{menu.name}</Typography>}
        />
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup row>
          {(menu.permissions || []).map(perm => (
            <FormControlLabel 
              key={perm.id} 
              control={
                <Checkbox 
                  checked={!!selectedPerms[perm.id]} 
                  onChange={() => handleTogglePerm(perm.id)} 
                />
              } 
              label={`${perm.name} (${perm.action})`} 
            />
          ))}
          {(!menu.permissions || menu.permissions.length === 0) && (!menu.children || menu.children.length === 0) && (
            <Typography variant="body2" color="textSecondary">No permissions defined.</Typography>
          )}
        </FormGroup>
        
        {menu.children && menu.children.length > 0 && (
          <Box mt={2}>
            {menu.children.map(child => (
              <MenuNode 
                key={child.id} 
                menu={child} 
                selectedPerms={selectedPerms} 
                handleTogglePerm={handleTogglePerm} 
                handleToggleMenuAll={handleToggleMenuAll} 
              />
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPermModal, setOpenPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedPerms, setSelectedPerms] = useState({});

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRoles(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/menus", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const map = {};
        const roots = [];
        data.data.forEach(m => { map[m.id] = { ...m, children: [] }; });
        data.data.forEach(m => {
          if (m.parent_id && map[m.parent_id]) {
            map[m.parent_id].children.push(map[m.id]);
          } else {
            roots.push(map[m.id]);
          }
        });
        setMenus(roots);
      }
    } catch (err) { console.error(err); }
  };

  const handleOpenRoleModal = (role = null) => {
    if (role) {
      setFormData({ name: role.name, description: role.description || "" });
      setSelectedRole(role);
    } else {
      setFormData({ name: "", description: "" });
      setSelectedRole(null);
    }
    setOpenRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedRole ? `http://localhost:5050/api/roles/${selectedRole.id}` : "http://localhost:5050/api/roles";
      const method = selectedRole ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      setOpenRoleModal(false);
      fetchRoles();
    } catch (error) { console.error(error); }
  };

  const handleOpenPermModal = (role) => {
    setSelectedRole(role);
    // Build hashmap of existing assigned permissions to pre-check boxes
    const dict = {};
    if (role.permissions) {
      role.permissions.forEach(p => { dict[p.id] = true; });
    }
    setSelectedPerms(dict);
    setOpenPermModal(true);
  };

  const handleTogglePerm = (permId) => {
    setSelectedPerms(prev => ({ ...prev, [permId]: !prev[permId] }));
  };

  const handleToggleMenuAll = (permIds, checked) => {
    setSelectedPerms(prev => {
      const next = { ...prev };
      permIds.forEach(id => { next[id] = checked; });
      return next;
    });
  };

  const handleSavePermissions = async () => {
    try {
      const permissionIds = Object.keys(selectedPerms).filter(k => selectedPerms[k]);
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5050/api/roles/${selectedRole.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissionIds }),
      });
      setOpenPermModal(false);
      fetchRoles();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Roles Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenRoleModal()}>
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Role Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Permissions Count</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.permissions?.length || 0} Permissions</TableCell>
                <TableCell>
                  <IconButton color="secondary" onClick={() => handleOpenPermModal(r)}><Security /></IconButton>
                  <IconButton color="primary" onClick={() => handleOpenRoleModal(r)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No roles found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Form */}
      <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedRole ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Role Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleModal(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Binding Form */}
      <Dialog open={openPermModal} onClose={() => setOpenPermModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Assign Permissions: {selectedRole?.name}</DialogTitle>
        <DialogContent dividers>
          {menus.map((menu) => (
            <MenuNode 
              key={menu.id} 
              menu={menu} 
              selectedPerms={selectedPerms} 
              handleTogglePerm={handleTogglePerm} 
              handleToggleMenuAll={handleToggleMenuAll} 
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermModal(false)}>Cancel</Button>
          <Button onClick={handleSavePermissions} variant="contained">Save Assignments</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
