"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import { 
  Building2, 
  Search, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  Globe,
  Plus,
  Edit,
  Users,
  Trash2,
  UserPlus
} from "lucide-react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PageHeader from "../../../../components/common/PageHeader";
import api from "../../../../utils/api";

const OrganizationList = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Org Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [activeOrg, setActiveOrg] = useState(null);
    
    // Member Modal States
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberLoading, setMemberLoading] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberError, setMemberError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        subdomain: "",
        ownerEmail: ""
    });

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/organizations");
            if (response.success) {
                setOrganizations(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
        const storedOrg = localStorage.getItem("active_organization");
        if (storedOrg) {
            try { setActiveOrg(JSON.parse(storedOrg)); } catch (e) {}
        }
    }, []);

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setFormError("");
        setIsSubmitting(true);
        try {
            const response = await api.post("/admin/organizations", formData);
            if (response.success) {
                setIsCreateModalOpen(false);
                setFormData({ name: "", subdomain: "", ownerEmail: "" });
                fetchOrganizations();
            }
        } catch (error) {
            setFormError(error.response?.data?.message || "Failed to create organization");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        setFormError("");
        setIsSubmitting(true);
        try {
            const response = await api.patch(`/admin/organizations/${selectedOrg.id}`, {
                name: formData.name
            });
            if (response.success) {
                setIsEditModalOpen(false);
                setSelectedOrg(null);
                setFormData({ name: "", subdomain: "", ownerEmail: "" });
                fetchOrganizations();
            }
        } catch (error) {
            setFormError(error.response?.data?.message || "Failed to update organization");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusToggle = async (id, currentIsActive) => {
        try {
            const response = await api.patch(`/admin/organizations/${id}`, {
                isActive: !currentIsActive,
                status: !currentIsActive ? 'Active' : 'Suspended'
            });
            if (response.success) {
                fetchOrganizations();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    // Member Management Logic
    const openMembersModal = (org) => {
        setSelectedOrg(org);
        setIsMembersModalOpen(true);
        fetchMembers(org.id);
    };

    const fetchMembers = async (orgId) => {
        setMemberLoading(true);
        try {
            const response = await api.get(`/admin/organizations/${orgId}/members`);
            if (response.success) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setMemberLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!memberEmail) return;
        setMemberError("");
        setIsSubmitting(true);
        try {
            const response = await api.post(`/admin/organizations/${selectedOrg.id}/members`, {
                email: memberEmail
            });
            if (response.success) {
                setMemberEmail("");
                fetchMembers(selectedOrg.id);
            }
        } catch (error) {
            setMemberError(error.response?.data?.message || "Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this user from the organization?")) return;
        try {
            const response = await api.delete(`/admin/organizations/${selectedOrg.id}/members/${userId}`);
            if (response.success) {
                fetchMembers(selectedOrg.id);
            }
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    const openEditModal = (org) => {
        setSelectedOrg(org);
        setFormData({
            name: org.name,
            subdomain: org.subdomain,
            ownerEmail: org.owner?.email || ""
        });
        setIsEditModalOpen(true);
    };

    const filteredOrgs = organizations.filter(org => {
        const query = searchQuery.toLowerCase();
        return (
            (org.name?.toLowerCase() || "").includes(query) ||
            (org.owner?.email?.toLowerCase() || "").includes(query) ||
            (org.subdomain?.toLowerCase() || "").includes(query)
        );
    });

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader 
                title="Organization Management" 
                subtitle="Manage all customer tenants and platform organizations"
                icon={<Building2 size={24} />}
                addButtonLabel="Add Organization"
                onAddClick={() => setIsCreateModalOpen(true)}
            />

            <Card sx={{ mt: 3, borderRadius: 4, border: '1px solid var(--border)' }} elevation={0}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                        <TextField
                            placeholder="Search by name, email or subdomain..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flexGrow: 1, maxWidth: 400 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Total Organizations: <strong>{organizations.length}</strong>
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Subdomain</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body2" color="text.secondary">Loading platform data...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrgs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body2" color="text.secondary">No organizations found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrgs.map((org) => (
                                        <TableRow key={org.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'rgba(79,70,229,0.1)', color: 'primary.main', borderRadius: 2 }}>
                                                        <Building2 size={20} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={700}>{org.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">ID: {org.id.substring(0, 8)}...</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{org.owner?.username || 'N/A'}</Typography>
                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <Mail size={12} /> {org.owner?.email || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    icon={<Globe size={14} />}
                                                    label={org.subdomain ? `${org.subdomain}.prontostack.com` : 'No subdomain'} 
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 1.5, fontSize: 11 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar size={14} /> {new Date(org.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={org.isActive ? "Active" : "Suspended"} 
                                                    color={org.isActive ? "success" : "error"}
                                                    size="small"
                                                    sx={{ borderRadius: 1.5, fontWeight: 700, minWidth: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Manage Members">
                                                    <IconButton 
                                                        onClick={() => openMembersModal(org)}
                                                        color="info"
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(2,132,199,0.05)', mr: 1 }}
                                                    >
                                                        <Users size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Details">
                                                    <IconButton 
                                                        onClick={() => openEditModal(org)}
                                                        color="primary"
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(79,70,229,0.05)', mr: 1 }}
                                                    >
                                                        <Edit size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={org.id === activeOrg?.id ? "Cannot suspend active workspace" : org.isActive ? "Suspend Workspace" : "Activate Workspace"}>
                                                    <span>
                                                        <IconButton 
                                                            onClick={() => handleStatusToggle(org.id, org.isActive)}
                                                            color={org.isActive ? "error" : "success"}
                                                            size="small"
                                                            disabled={org.id === activeOrg?.id}
                                                            sx={{ 
                                                                bgcolor: org.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                                                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.25)' }
                                                            }}
                                                        >
                                                            {org.isActive ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create Organization Modal */}
            <Dialog 
                open={isCreateModalOpen} 
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                    Add New Organization
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Register a new tenant organization on the platform. The specified owner will receive administrative access to this workspace.
                    </Typography>

                    {formError && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#fee2e2', color: '#b91c1c', borderRadius: 2, border: '1px solid #f87171' }}>
                            <Typography variant="body2" fontWeight={600}>{formError}</Typography>
                        </Box>
                    )}

                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Organization Name"
                            placeholder="e.g. Acme Corporation"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Subdomain"
                            placeholder="e.g. acme"
                            value={formData.subdomain}
                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">.prontostack.com</InputAdornment>,
                            }}
                            helperText="Lowercase alphanumeric characters and hyphens only."
                        />
                        <TextField
                            fullWidth
                            label="Owner Email"
                            placeholder="e.g. admin@acme.com"
                            value={formData.ownerEmail}
                            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                            helperText="The user must already exist in the system."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setIsCreateModalOpen(false)} 
                        variant="text" 
                        disabled={isSubmitting}
                        sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateOrg} 
                        variant="contained" 
                        disabled={isSubmitting}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            borderRadius: 2,
                            px: 4,
                            py: 1.25,
                            boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.25)'
                        }}
                    >
                        {isSubmitting ? "Creating..." : "Create Organization"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Organization Modal */}
            <Dialog 
                open={isEditModalOpen} 
                onClose={() => !isSubmitting && setIsEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                    Edit Organization
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Update the organization details. Note: Subdomain and Owner cannot be changed from here.
                    </Typography>

                    {formError && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#fee2e2', color: '#b91c1c', borderRadius: 2, border: '1px solid #f87171' }}>
                            <Typography variant="body2" fontWeight={600}>{formError}</Typography>
                        </Box>
                    )}

                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Organization Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            disabled
                            label="Subdomain"
                            value={formData.subdomain}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">.prontostack.com</InputAdornment>,
                            }}
                        />
                        <TextField
                            fullWidth
                            disabled
                            label="Owner Email"
                            value={formData.ownerEmail}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setIsEditModalOpen(false)} 
                        variant="text" 
                        disabled={isSubmitting}
                        sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdateOrg} 
                        variant="contained" 
                        disabled={isSubmitting}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            borderRadius: 2,
                            px: 4,
                            py: 1.25,
                            boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.25)'
                        }}
                    >
                        {isSubmitting ? "Updating..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Members Modal */}
            <Dialog 
                open={isMembersModalOpen} 
                onClose={() => setIsMembersModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Users size={28} /> Manage Workspace Members
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Organization: <strong>{selectedOrg?.name}</strong> ({selectedOrg?.subdomain}.prontostack.com)
                    </Typography>

                    {/* Add Member Form */}
                    <Box sx={{ mb: 4, p: 2.5, bgcolor: 'secondary.main', borderRadius: 3, border: '1px solid var(--border)' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Assign New Member</Typography>
                        <Stack direction="row" spacing={2} component="form" onSubmit={handleAddMember}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter user's email address..."
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: <Mail size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting || !memberEmail}
                                startIcon={<UserPlus size={18} />}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', px: 3 }}
                            >
                                {isSubmitting ? "Adding..." : "Assign User"}
                            </Button>
                        </Stack>
                        {memberError && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                                {memberError}
                            </Typography>
                        )}
                    </Box>

                    {/* Members List */}
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--border)', borderRadius: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>User</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {memberLoading ? (
                                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>Loading members...</TableCell></TableRow>
                                ) : members.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>No members found.</TableCell></TableRow>
                                ) : (
                                    members.map((m) => (
                                        <TableRow key={m.id} hover>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={600}>{m.user?.username}</Typography>
                                            </TableCell>
                                            <TableCell>{m.user?.email}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Remove access">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleRemoveMember(m.user?.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setIsMembersModalOpen(false)} 
                        variant="outlined" 
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizationList;
