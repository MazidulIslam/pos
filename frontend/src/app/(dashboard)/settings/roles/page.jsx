"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Checkbox, FormControlLabel, FormGroup, Accordion, AccordionSummary, AccordionDetails, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { Add, Edit, Delete, Security, ExpandMore } from "@mui/icons-material";
import config from "../../../../config";
import { useRouter } from "next/navigation";


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

  const isRoot = !menu.parent_id;

  return (
    <Accordion 
      defaultExpanded 
      sx={{ 
        ml: isRoot ? 0 : 4, 
        mt: 1.5, 
        boxShadow: isRoot ? "0px 4px 20px rgba(0, 0, 0, 0.05)" : "none", 
        border: isRoot ? '1px solid transparent' : '1px solid',
        borderColor: 'divider',
        borderRadius: '8px !important',
        overflow: 'hidden',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMore sx={{ color: isRoot ? 'white' : 'action.active' }} />}
        sx={{
          bgcolor: isRoot ? 'primary.main' : 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiAccordionSummary-content': { my: 1 }
        }}
      >
        <FormControlLabel
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          control={
            <Checkbox
              sx={{ color: isRoot ? 'rgba(255,255,255,0.7)' : 'action.active', '&.Mui-checked': { color: isRoot ? 'white' : 'primary.main' }, '&.MuiCheckbox-indeterminate': { color: isRoot ? 'white' : 'primary.main' } }}
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={(e) => handleToggleMenuAll(allPermIds, e.target.checked)}
            />
          }
          label={<Typography fontWeight="bold" sx={{ color: isRoot ? 'white' : 'text.primary', fontSize: isRoot ? '1.05rem' : '0.95rem' }}>{menu.name}</Typography>}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: 'background.paper', p: 3 }}>
        <FormGroup row sx={{ gap: 2 }}>
          {(menu.permissions || []).map(perm => (
            <FormControlLabel 
              key={perm.id} 
              control={
                <Checkbox 
                  checked={!!selectedPerms[perm.id]} 
                  onChange={() => handleTogglePerm(perm.id)} 
                  color="primary"
                />
              } 
              label={
                <Typography variant="body2" sx={{ fontWeight: 500, bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 1 }}>
                  {perm.name} <Typography component="span" variant="caption" color="text.secondary">({perm.action})</Typography>
                </Typography>
              } 
            />
          ))}
          {(!menu.permissions || menu.permissions.length === 0) && (!menu.children || menu.children.length === 0) && (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">No permissions defined.</Typography>
          )}
        </FormGroup>
        
        {menu.children && menu.children.length > 0 && (
          <Box mt={3} pt={2} borderTop="1px dashed" borderColor="divider">
            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1} mb={2} display="block">
              Sub-Menus
            </Typography>
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
  const router = useRouter();
  const [roles, setRoles] = useState([]);

  const [menus, setMenus] = useState([]);
  
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPermModal, setOpenPermModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedPerms, setSelectedPerms] = useState({});

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    Promise.all([fetchRoles(), fetchMenus()]).finally(() => setLoading(false));
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      const data = await res.json();

      if (data.success) {
        setRoles(data.data);
      } else {
        showToast(data.message || "Failed to fetch roles", "error");
      }
    } catch (err) { 
        console.error(err); 
        showToast("Network error fetching roles", "error");
    }
  };

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
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
      } else {
        showToast(data.message || "Failed to fetch menus", "error");
      }
    } catch (err) { 
        console.error(err); 
        showToast("Network error fetching menus", "error");
    }
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
      const url = selectedRole ? `${config.API_BASE_URL}/roles/${selectedRole.id}` : `${config.API_BASE_URL}/roles`;
      const method = selectedRole ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();

      
      if (data.success) {
        showToast("Role saved successfully!");
        setOpenRoleModal(false);
        fetchRoles();
      } else {
        showToast(data.message || "Failed to save role", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast("Network error saving role", "error");
    }
  };

  const handleOpenPermModal = (role) => {
    setSelectedRole(role);
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

  const getAllSystemPermIds = () => {
    let ids = [];
    const extractIds = (node) => {
      (node.permissions || []).forEach(p => ids.push(p.id));
      (node.children || []).forEach(child => extractIds(child));
    };
    menus.forEach(m => extractIds(m));
    return ids;
  };

  const allSystemPermIds = getAllSystemPermIds();
  const systemCheckedCount = allSystemPermIds.filter(id => selectedPerms[id]).length;
  const isMasterAllChecked = allSystemPermIds.length > 0 && systemCheckedCount === allSystemPermIds.length;
  const isMasterIndeterminate = systemCheckedCount > 0 && systemCheckedCount < allSystemPermIds.length;

  const handleToggleMasterAll = (checked) => {
    setSelectedPerms(prev => {
      const next = { ...prev };
      allSystemPermIds.forEach(id => { next[id] = checked; });
      return next;
    });
  };

  const handleSavePermissions = async () => {
    try {
      const permissionIds = Object.keys(selectedPerms).filter(k => selectedPerms[k]);
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/roles/${selectedRole.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissionIds }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();


      if (data.success) {
        showToast("Permissions assigned successfully!");
        setOpenPermModal(false);
        fetchRoles();
      } else {
        showToast(data.message || "Failed to assign permissions", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast("Network error capturing permissions", "error");
    }
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : (
              roles.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.permissions?.length || 0} Permissions</TableCell>
                <TableCell>
                  <IconButton sx={{ color: 'warning.main', mr: 1, bgcolor: 'rgba(237, 108, 2, 0.1)', '&:hover': { bgcolor: 'warning.main', color: 'white' } }} onClick={() => handleOpenPermModal(r)} title="Assign Permissions"><Security /></IconButton>
                  <IconButton color="primary" onClick={() => handleOpenRoleModal(r)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            )))}
            {!loading && roles.length === 0 && (
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
          <Box mb={3} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Global Assigner</Typography>
              <Typography variant="body2" color="text.secondary">
                {isMasterAllChecked ? "Currently granting all system permissions." : "Instantly grant or revoke all system permissions."}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  size="large"
                  checked={isMasterAllChecked}
                  indeterminate={isMasterIndeterminate}
                  onChange={(e) => handleToggleMasterAll(e.target.checked)}
                  color="warning"
                />
              }
              label={<Typography fontWeight="bold" color="warning.main">Toggle All Modules</Typography>}
            />
          </Box>
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
      
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
