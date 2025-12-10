import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { customRoleService, CreateCustomRoleData, CustomRolePermissions } from '../services/customRoleService';
import { useAuth } from '../context/AuthContext';

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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  padding: 0;
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 30px 30px 0;
  border-bottom: 1px solid #2d3748;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  margin-top: 0;
`;

const ModalSubtitle = styled.p`
  opacity: 0.9;
  margin-bottom: 30px;
  margin-top: 0;
`;

const ModalBody = styled.div`
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  background: #1a1a2e;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #2d3748;
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
  background: #2d3748;
  color: #e2e8f0;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }
`;

const ColorIconRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 16px;
  align-items: end;
`;

const ColorPicker = styled.div`
  position: relative;
`;

const ColorInput = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid #4a5568;
  border-radius: 8px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }
`;

const IconPreview = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}15;
  border: 2px solid ${props => props.$color}30;
  font-size: 18px;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PermissionCard = styled.div<{ $enabled: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$enabled ? '#667eea' : '#4a5568'};
  border-radius: 12px;
  background: ${props => props.$enabled ? '#1e40af20' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
  }
`;

const PermissionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const PermissionIcon = styled.div`
  font-size: 16px;
`;

const PermissionName = styled.div`
  font-weight: 600;
  color: #e2e8f0;
  font-size: 14px;
`;

const PermissionDescription = styled.div`
  color: #a0aec0;
  font-size: 12px;
  line-height: 1.4;
`;

const TemplateSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #2d3748;
  border-radius: 12px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const TemplateButton = styled.button`
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 8px;
  background: #1a1a2e;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  
  &:hover {
    border-color: #667eea;
    background: #1e40af20;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 30px;
  border-top: 1px solid #2d3748;
  background: #2d3748;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }
    
    &:disabled {
      opacity: 0.5;
      transform: none;
      cursor: not-allowed;
    }
  ` : `
    background: #2d3748;
    color: #e2e8f0;
    border: 2px solid #4a5568;
    
    &:hover {
      background: #4a5568;
      border-color: #667eea;
    }
  `}
`;

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PERMISSION_INFO = {
  canManageUsers: { icon: '👥', name: 'Manage Users', desc: 'Create, edit, and manage user accounts' },
  canManageRoles: { icon: '🏷️', name: 'Manage Roles', desc: 'Assign and modify user roles' },
  canManageContent: { icon: '📝', name: 'Manage Content', desc: 'Create, edit, and moderate content' },
  canManageSlots: { icon: '🎰', name: 'Manage Slots', desc: 'Configure and manage slot systems' },
  canModerate: { icon: '🛡️', name: 'Moderate', desc: 'Review and moderate user content' },
  canAccessPremiumFeatures: { icon: '💎', name: 'Premium Features', desc: 'Access premium functionality' },
  canViewAnalytics: { icon: '📊', name: 'View Analytics', desc: 'Access reports and analytics' },
  canManagePartners: { icon: '🤝', name: 'Manage Partners', desc: 'Handle partner relationships' },
};

export const CustomRoleModal: React.FC<CustomRoleModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateCustomRoleData>({
    roleName: '',
    displayName: '',
    description: '',
    permissions: {},
    color: '#667eea',
    icon: '🔑'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        roleName: '',
        displayName: '',
        description: '',
        permissions: {},
        color: '#667eea',
        icon: '🔑'
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    } else {
      const validation = customRoleService.validateRoleName(formData.roleName);
      if (!validation.isValid) {
        newErrors.roleName = validation.error!;
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      await customRoleService.createCustomRole(formData, user.id);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create role' });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const applyTemplate = (templateKey: string) => {
    const templates = customRoleService.getPermissionTemplates();
    const template = templates[templateKey];
    
    if (template) {
      setFormData(prev => ({
        ...prev,
        permissions: { ...template.permissions }
      }));
    }
  };

  const generateRoleName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      displayName: value,
      roleName: prev.roleName || generateRoleName(value)
    }));
  };

  return (
    <Modal $isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>🎨 Create Custom Role</ModalTitle>
          <ModalSubtitle>
            Design a custom role with specific permissions for your users
          </ModalSubtitle>
        </ModalHeader>

        <ModalBody>
          {/* Template Section */}
          <TemplateSection>
            <Label>Quick Start Templates</Label>
            <TemplateGrid>
              {Object.entries(customRoleService.getPermissionTemplates()).map(([key, template]) => (
                <TemplateButton key={key} onClick={() => applyTemplate(key)}>
                  {template.name}
                </TemplateButton>
              ))}
            </TemplateGrid>
          </TemplateSection>

          {/* Basic Info */}
          <FormRow>
            <FormGroup>
              <Label>Display Name *</Label>
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="e.g., Content Manager"
                className={errors.displayName ? 'error' : ''}
              />
              {errors.displayName && <ErrorMessage>{errors.displayName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Role Name * (system identifier)</Label>
              <Input
                type="text"
                value={formData.roleName}
                onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
                placeholder="e.g., content_manager"
                className={errors.roleName ? 'error' : ''}
              />
              {errors.roleName && <ErrorMessage>{errors.roleName}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this role is for and what users with this role can do..."
            />
            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
          </FormGroup>

          {/* Color and Icon */}
          <FormRow>
            <FormGroup>
              <Label>Role Color</Label>
              <ColorIconRow>
                <ColorPicker>
                  <ColorInput
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </ColorPicker>
                <IconPreview $color={formData.color || '#667eea'}>
                  {formData.icon}
                </IconPreview>
              </ColorIconRow>
            </FormGroup>

            <FormGroup>
              <Label>Role Icon</Label>
              <Input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🔑"
                maxLength={10}
              />
            </FormGroup>
          </FormRow>

          {/* Permissions */}
          <FormGroup>
            <Label>Permissions</Label>
            <PermissionsGrid>
              {Object.entries(PERMISSION_INFO).map(([key, info]) => (
                <PermissionCard
                  key={key}
                  $enabled={!!formData.permissions[key]}
                  onClick={() => togglePermission(key)}
                >
                  <PermissionHeader>
                    <PermissionIcon>{info.icon}</PermissionIcon>
                    <PermissionName>{info.name}</PermissionName>
                  </PermissionHeader>
                  <PermissionDescription>{info.desc}</PermissionDescription>
                </PermissionCard>
              ))}
            </PermissionsGrid>
          </FormGroup>

          {errors.submit && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {errors.submit}
            </div>
          )}
        </ModalBody>

        <ModalActions>
          <Button $variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Role'}
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};