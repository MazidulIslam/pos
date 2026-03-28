"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, FormGroup, FormControlLabel, Checkbox, Chip, TextField,
  Snackbar, Alert, CircularProgress
} from "@mui/material";
import { Edit, Security, ExpandMore, Add } from "@mui/icons-material";

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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  
  const [openPermModal, setOpenPermModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "" });
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPerms, setSelectedPerms] = useState({});

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    Promise.all([fetchUsers(), fetchRoles(), fetchMenus()]).finally(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        showToast(data.message || "Failed to fetch users", "error");
      }
    } catch (err) { 
        console.error(err); 
        showToast("Network error fetching users", "error");
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/roles", { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch("http://localhost:5050/api/menus", { headers: { Authorization: `Bearer ${token}` } });
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

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        roleId: user.roleId || ""
      });
      setSelectedUser(user);
    } else {
      setFormData({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "" });
      setSelectedUser(null);
    }
    setOpenUserModal(true);
  };

  const handleOpenPermModal = (user) => {
    setSelectedUser(user);
    const dict = {};
    if (user.directPermissions) {
      user.directPermissions.forEach(p => { dict[p.id] = true; });
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
      const data = await fetch(`http://localhost:5050/api/users/${selectedUser.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissionIds }),
      }).then(res => res.json());

      if (data.success) {
        showToast("Direct permissions assigned!");
        setOpenPermModal(false);
        fetchUsers();
      } else {
        showToast(data.message || "Failed to save permissions", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast("Network error recording permissions", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedUser ? `http://localhost:5050/api/users/${selectedUser.id}` : `http://localhost:5050/api/users`;
      const method = selectedUser ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      const data = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then(res => res.json());

      if (data.success) {
        showToast(`User successfully ${selectedUser ? "updated" : "created"}!`);
        setOpenUserModal(false);
        setFormData({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "" });
        fetchUsers();
      } else {
        showToast(data.message || "Failed to save user", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast("Network error saving user", "error");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Users Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenUserModal()}>
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Assigned Role</strong></TableCell>
              <TableCell><strong>Direct Permissions</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.firstName} {u.lastName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>
                  {u.role ? <Chip label={u.role.name} color={u.role.name === 'Super Admin' ? 'error' : 'primary'} size="small" /> : <Typography variant="body2" color="textSecondary">None</Typography>}
                </TableCell>
                <TableCell>{u.directPermissions?.length || 0} Custom Overrides</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenUserModal(u)} title="Edit User"><Edit /></IconButton>
                  <IconButton sx={{ color: 'warning.main', ml: 1, bgcolor: 'rgba(237, 108, 2, 0.1)', '&:hover': { bgcolor: 'warning.main', color: 'white' } }} onClick={() => handleOpenPermModal(u)} title="Assign Direct Permissions"><Security /></IconButton>
                </TableCell>
              </TableRow>
            )))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>



      {/* Permissions Binding Form */}
      <Dialog open={openPermModal} onClose={() => setOpenPermModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Assign Explicit Direct Permissions: {selectedUser?.firstName}</DialogTitle>
        <DialogContent dividers>
          <Box mb={3} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Global Direct Permissions</Typography>
              <Typography variant="body2" color="text.secondary">
                {isMasterAllChecked ? "Currently overriding all system permissions." : "Instantly assign or revoke all system permissions for this User."}
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
          <Typography variant="body2" color="textSecondary" mb={2} sx={{ fontStyle: 'italic', pl: 1 }}>
            Direct permissions override or supplement the User's Role permissions.
          </Typography>
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
      {/* User Creation Form */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="First Name" fullWidth value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          <TextField margin="dense" label="Last Name" fullWidth value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          <TextField margin="dense" label="Username" fullWidth value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
          <TextField margin="dense" label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField margin="dense" label="Password" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <TextField margin="dense" label="Phone" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="new-user-role-label">User Role (Optional)</InputLabel>
            <Select
              labelId="new-user-role-label"
              value={formData.roleId}
              label="User Role (Optional)"
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {roles.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserModal(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">Save</Button>
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
