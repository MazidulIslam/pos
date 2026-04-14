"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, FormGroup, FormControlLabel, Checkbox, Chip, TextField,
  Snackbar, Alert, CircularProgress, Switch, TablePagination
} from "@mui/material";
import { Edit, Security, ExpandMore, Add, Visibility, Delete } from "@mui/icons-material";
import config from "../../../../config";
import { useRouter } from "next/navigation";
import api from "../../../../utils/api";
import { usePermissions } from "../../../../hooks/usePermissions";
import { ConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { PageHeader } from "../../../../components/common/PageHeader";



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
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');
  const canDelete = hasPermission('users.delete');
  const [users, setUsers] = useState([]);

  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  
  const [openPermModal, setOpenPermModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "", isActive: true });
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPerms, setSelectedPerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const [isSearching, setIsSearching] = useState(false);


  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const prevPage = useRef(page);
  const prevRows = useRef(rowsPerPage);

  useEffect(() => {
    // 1. Force fetch if page or rowsPerPage changed
    const isPaginationChange = page !== prevPage.current || rowsPerPage !== prevRows.current;
    prevPage.current = page;
    prevRows.current = rowsPerPage;

    if (isPaginationChange || searchTerm === "") {
        fetchUsers();
    } else {
        // Hybrid logic for search: check local matches
        const searchLower = searchTerm.toLowerCase();
        const hasLocalMatches = users.some(u => 
            u.username?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower) ||
            u.firstName?.toLowerCase().includes(searchLower) ||
            u.lastName?.toLowerCase().includes(searchLower) ||
            u.role?.name?.toLowerCase().includes(searchLower)
        );

        if (!hasLocalMatches) {
            fetchUsers();
        }
    }
  }, [page, rowsPerPage, searchTerm]);

  const handleSearchChange = useCallback((val) => {
    setSearchTerm(val);
    setPage(0);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setIsSearching(true);
    try {
      const data = await api.get("/users", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      if (data.success) {
        setUsers(data.data);
        setTotalCount(data.meta.total);
      } else {
        showToast(data.message || "Failed to fetch users", "error");
      }
    } catch (err) { 
        console.error(err); 
        showToast(err.message || "Network error fetching users", "error");
    } finally {
        setLoading(false);
        setIsSearching(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await api.get("/roles");
      if (data.success) {
        setRoles(data.data);
      } else {
        showToast(data.message || "Failed to fetch roles", "error");
      }
    } catch (err) { 
        console.error(err); 
        showToast(err.message || "Network error fetching roles", "error");
    }
  };

  const fetchMenus = async () => {
    try {
      const data = await api.get("/menus");
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
        showToast(err.message || "Network error fetching menus", "error");
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
        roleId: user.roleId || "",
        isActive: user.isActive !== false
      });
      setSelectedUser(user);
    } else {
      setFormData({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "", isActive: true });
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
      const data = await api.post(`/users/${selectedUser.id}/permissions`, { permissionIds });

      if (data.success) {
        showToast("Direct permissions assigned!");
        setOpenPermModal(false);
        fetchUsers();
      } else {
        showToast(data.message || "Failed to save permissions", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast(error.message || "Network error recording permissions", "error");
    }
  };


  const handleOpenDeleteConfirm = (user) => {
    setSelectedUser(user);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    try {
      const data = await api.delete(`/users/${selectedUser.id}`);
      if (data.success) {
        showToast("User successfully removed from the system.");
        setOpenDeleteConfirm(false);
        fetchUsers();
      } else {
        showToast(data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error deleting user", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      const endpoint = selectedUser ? `/users/${selectedUser.id}` : `/users`;
      const payload = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      const data = selectedUser 
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      if (data.success) {
        showToast(`User successfully ${selectedUser ? "updated" : "created"}!`);
        setOpenUserModal(false);
        setFormData({ username: "", email: "", password: "", firstName: "", lastName: "", phone: "", roleId: "", isActive: true });
        fetchUsers();
      } else {
        showToast(data.message || "Failed to save user", "error");
      }
    } catch (error) { 
        console.error(error); 
        showToast(error.message || "Network error saving user", "error");
    }
  };

  const filteredUsers = React.useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return users.filter(u => {
      return (
        u.username?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower) ||
        u.role?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  return (
    <Box>
      <PageHeader
        title="Users Management"
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        addButtonLabel="Add User"


        onAddClick={() => handleOpenUserModal()}
        canCreate={canCreate}
        searchPlaceholder="Search by name, email, or role..."
        isSearching={isSearching}
      />


      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Assigned Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (

              <TableRow key={u.id} hover>
                <TableCell>{u.firstName} {u.lastName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>
                  {u.role ? <Chip label={u.role.name} color={u.role.name === 'Super Admin' ? 'error' : 'primary'} size="small" /> : <Typography variant="body2" color="textSecondary">None</Typography>}
                </TableCell>
                <TableCell>
                   <Box display="flex" alignItems="center">
                     <Typography variant="caption" sx={{ color: u.isActive !== false ? 'success.main' : 'text.disabled', fontWeight: 'bold' }}>
                       {u.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                     </Typography>
                   </Box>
                </TableCell>
                <TableCell>{u.directPermissions?.length || 0} Custom Overrides</TableCell>
                <TableCell>
                  <IconButton color="info" onClick={() => { setSelectedUser(u); setOpenViewModal(true); }} title="View All Permissions"><Visibility /></IconButton>
                  <IconButton color="primary" onClick={() => handleOpenUserModal(u)} title="Edit User" disabled={!canUpdate}><Edit /></IconButton>
                  <IconButton sx={{ color: 'warning.main', ml: 1, bgcolor: 'rgba(237, 108, 2, 0.1)', '&:hover': { bgcolor: 'warning.main', color: 'white' } }} onClick={() => handleOpenPermModal(u)} title="Assign Direct Permissions" disabled={!canUpdate}><Security /></IconButton>
                  <IconButton color="error" onClick={() => handleOpenDeleteConfirm(u)} title="Delete User" disabled={!canDelete}><Delete /></IconButton>
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{ mt: 2 }}
      />



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
          <Button onClick={handleSavePermissions} variant="contained" disabled={!canUpdate}>Save Assignments</Button>
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
              {roles.filter(r => r.isActive !== false || r.id === formData.roleId).map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedUser && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="success"
                />
              }
              label={formData.isActive ? "Active" : "Inactive"}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserModal(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" disabled={selectedUser ? !canUpdate : !canCreate}>Save</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* View All Permissions Modal */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Permissions Overview: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
        <DialogContent dividers>
          <Box mb={3} p={2} sx={{ bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
            <Typography variant="subtitle2" color="info.dark" fontWeight="bold">Role: {selectedUser?.role?.name || 'No Role Assigned'}</Typography>
            <Typography variant="body2" color="text.secondary">Below is the complete list of system permissions. Highlighted items represent what this user can currently access.</Typography>
          </Box>
          
          {menus.map((menu) => {
            const renderMenu = (node, level = 0) => {
              const rolePermIds = new Set((selectedUser?.role?.permissions || []).map(p => p.id));
              const directPermIds = new Set((selectedUser?.directPermissions || []).map(p => p.id));
              
              return (
                <Box key={node.id} sx={{ ml: level * 3, mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                    {node.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(node.permissions || []).map(p => {
                      const fromRole = rolePermIds.has(p.id);
                      const fromDirect = directPermIds.has(p.id);
                      const hasIt = fromRole || fromDirect;
                      
                      return (
                        <Chip 
                          key={p.id}
                          label={p.name}
                          size="small"
                          color={hasIt ? "success" : "default"}
                          variant={hasIt ? "filled" : "outlined"}
                          sx={{ 
                            opacity: hasIt ? 1 : 0.4,
                            fontWeight: 600,
                            borderStyle: fromDirect ? 'dashed' : 'solid',
                            borderColor: fromDirect ? 'warning.main' : 'inherit'
                          }}
                          title={fromRole && fromDirect ? "Both Role & Direct" : fromRole ? "From Role" : fromDirect ? "Directly Assigned" : "No Access"}
                        />
                      );
                    })}
                  </Box>
                  {node.children && node.children.map(child => renderMenu(child, level + 1))}
                </Box>
              );
            };
            return renderMenu(menu);
          })}
        </DialogContent>
        <DialogActions>
          <Box sx={{ flexGrow: 1, px: 2, display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
              <Typography variant="caption">Role/Direct Access</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, border: '1px dashed', borderColor: 'warning.main', borderRadius: '50%' }} />
              <Typography variant="caption">Custom Override</Typography>
            </Box>
          </Box>
          <Button onClick={() => setOpenViewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={openDeleteConfirm} 
        onClose={() => setOpenDeleteConfirm(false)} 
        onConfirm={handleDeleteUser}
        title="Permanently Remove User?"
        message={`This action will soft-delete ${selectedUser?.username} from the system. They will no longer be able to log in, and their data will be hidden from all active lists.`}
        severity="error"
        confirmText="Yes, Delete User"
      />
    </Box>
  );
}
