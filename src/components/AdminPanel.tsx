import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePermissions } from './RoleGuard';
import { roleManagementService } from '../services/roleManagement';
import { UserRole, ROLE_DISPLAY_NAMES, ROLE_COLORS } from '../types/roles';
import { RoleBadge } from './RoleBadge';
import { UserProfile } from '../services/supabase';

const AdminContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 80px 1fr 200px 150px 120px 200px;
  gap: 16px;
  padding: 20px 24px;
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.div<{ $selected?: boolean }>`
  display: grid;
  grid-template-columns: 60px 80px 1fr 200px 150px 120px 200px;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? '#f0f9ff' : 'white'};
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
`;

const UserEmail = styled.div`
  color: #6b7280;
  font-size: 12px;
`;

const DateText = styled.div`
  color: #6b7280;
  font-size: 13px;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$active ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$active ? '#166534' : '#dc2626'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.edit {
    background: #dbeafe;
    color: #1d4ed8;
    
    &:hover {
      background: #bfdbfe;
    }
  }
  
  &.delete {
    background: #fee2e2;
    color: #dc2626;
    
    &:hover {
      background: #fecaca;
    }
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
`;

const BulkSelect = styled.input`
  margin-right: 8px;
`;

const BulkButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.assign {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  }
  
  &.remove {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
`;

const RoleSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3`
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #374151;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  font-size: 16px;
  color: #6b7280;
`;

interface AdminPanelProps {}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
  const { hasPermission, role } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>(UserRole.USER);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check permissions
  if (!hasPermission('canManageUsers')) {
    return (
      <AdminContainer>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </AdminContainer>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await roleManagementService.getAllUsers(role);
      setUsers(allUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const assignBulkRole = async () => {
    try {
      setError(null);
      const promises = Array.from(selectedUsers).map(userId =>
        roleManagementService.updateUserRole(role, userId, bulkRole)
      );
      
      await Promise.all(promises);
      setSuccess(`Successfully assigned ${ROLE_DISPLAY_NAMES[bulkRole]} role to ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign roles');
    }
  };

  const removeBulkRole = async () => {
    try {
      setError(null);
      const promises = Array.from(selectedUsers).map(userId =>
        roleManagementService.updateUserRole(role, userId, UserRole.USER)
      );
      
      await Promise.all(promises);
      setSuccess(`Successfully removed roles from ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove roles');
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setError(null);
      await roleManagementService.updateUserRole(role, userId, newRole);
      setSuccess(`Successfully updated user role to ${ROLE_DISPLAY_NAMES[newRole]}`);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalUsers, activeUsers, roleStats };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AdminContainer>
        <LoadingSpinner>Loading users...</LoadingSpinner>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Header>
        <Title>👑 Admin Panel</Title>
        <Button $variant="primary" onClick={() => setShowCreateRole(true)}>
          Create Custom Role
        </Button>
      </Header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.activeUsers}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.roleStats.superadmin || 0}</StatValue>
          <StatLabel>Superadmins</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.roleStats.admin || 0}</StatValue>
          <StatLabel>Admins</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.roleStats.premium || 0}</StatValue>
          <StatLabel>Premium Users</StatLabel>
        </StatCard>
      </StatsContainer>

      <UsersTable>
        <BulkActions>
          <BulkSelect
            type="checkbox"
            checked={selectedUsers.size === users.length && users.length > 0}
            onChange={toggleSelectAll}
          />
          <span>Selected: {selectedUsers.size} users</span>
          
          <RoleSelect value={bulkRole} onChange={(e) => setBulkRole(e.target.value as UserRole)}>
            {Object.values(UserRole).map(roleValue => (
              <option key={roleValue} value={roleValue}>
                {ROLE_DISPLAY_NAMES[roleValue]}
              </option>
            ))}
          </RoleSelect>
          
          <BulkButton className="assign" onClick={assignBulkRole} disabled={selectedUsers.size === 0}>
            Assign Role
          </BulkButton>
          
          <BulkButton className="remove" onClick={removeBulkRole} disabled={selectedUsers.size === 0}>
            Remove Roles
          </BulkButton>
        </BulkActions>

        <TableHeader>
          <div></div>
          <div>Avatar</div>
          <div>User</div>
          <div>Role</div>
          <div>Joined</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>

        {users.map((user) => (
          <TableRow key={user.id} $selected={selectedUsers.has(user.id)}>
            <Checkbox
              type="checkbox"
              checked={selectedUsers.has(user.id)}
              onChange={() => toggleUserSelection(user.id)}
            />
            <UserAvatar src={user.profile_image_url} alt={user.display_name} />
            <UserInfo>
              <UserName>{user.display_name}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
            <div>
              <RoleBadge role={user.role} size="small" />
            </div>
            <DateText>{formatDate(user.created_at)}</DateText>
            <StatusBadge $active={user.is_active}>
              {user.is_active ? 'Active' : 'Inactive'}
            </StatusBadge>
            <ActionButtons>
              <ActionButton className="edit" onClick={() => setEditingUser(user)}>
                Edit Role
              </ActionButton>
            </ActionButtons>
          </TableRow>
        ))}
      </UsersTable>

      {/* Edit User Modal */}
      <Modal $isOpen={!!editingUser}>
        <ModalContent>
          <ModalTitle>Edit User Role</ModalTitle>
          {editingUser && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <UserAvatar src={editingUser.profile_image_url} alt={editingUser.display_name} />
                <div>
                  <UserName>{editingUser.display_name}</UserName>
                  <UserEmail>{editingUser.email}</UserEmail>
                </div>
              </div>
              
              <FormGroup>
                <Label>Current Role</Label>
                <RoleBadge role={editingUser.role} size="medium" />
              </FormGroup>
              
              <FormGroup>
                <Label>New Role</Label>
                <RoleSelect 
                  value={bulkRole} 
                  onChange={(e) => setBulkRole(e.target.value as UserRole)}
                >
                  {Object.values(UserRole).map(roleValue => (
                    <option key={roleValue} value={roleValue}>
                      {ROLE_DISPLAY_NAMES[roleValue]}
                    </option>
                  ))}
                </RoleSelect>
              </FormGroup>
            </div>
          )}
          
          <ModalActions>
            <Button $variant="secondary" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              $variant="primary" 
              onClick={() => editingUser && updateUserRole(editingUser.id, bulkRole)}
            >
              Update Role
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Create Custom Role Modal */}
      <Modal $isOpen={showCreateRole}>
        <ModalContent>
          <ModalTitle>Create Custom Role</ModalTitle>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Note: Custom roles require database schema updates and will be added as new enum values.
          </p>
          
          <FormGroup>
            <Label>Role Name</Label>
            <Input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., moderator, vip, partner"
            />
          </FormGroup>
          
          <ModalActions>
            <Button $variant="secondary" onClick={() => setShowCreateRole(false)}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={() => {
              // This would require backend implementation
              setError('Custom role creation requires backend implementation');
              setShowCreateRole(false);
            }}>
              Create Role
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </AdminContainer>
  );
};