'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Loader2, MoreVertical, Shield, User, UserMinus, UserCog } from 'lucide-react';
import { GroupMembersProps, GroupMember } from '@/app/types/community';

/**
 * GroupMembers component displays and manages group members
 * 
 * Features:
 * - Collapsible sections for admins, moderators and regular members
 * - Admin controls for changing member roles and removing members
 * - Mobile-friendly design
 * - Premium UI with animations and visual feedback
 */
const GroupMembers: React.FC<GroupMembersProps> = ({
  members,
  isLoading,
  groupId,
  currentUserId,
  isAdmin,
  onRemoveMember,
  onChangeMemberRole,
}) => {
  const [showActionMenuForUser, setShowActionMenuForUser] = useState<string | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'admins' | 'moderators' | 'members' | null>(null);
  
  // Group members by role
  const admins = members.filter(member => member.role === 'admin');
  const moderators = members.filter(member => member.role === 'moderator');
  const regularMembers = members.filter(member => member.role === 'member');
  
  const toggleSection = (section: 'admins' | 'moderators' | 'members') => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const handleRemoveMember = (userId: string) => {
    if (confirmRemove === userId) {
      if (onRemoveMember) {
        onRemoveMember(userId);
      }
      setConfirmRemove(null);
      setShowActionMenuForUser(null);
    } else {
      setConfirmRemove(userId);
    }
  };
  
  const handleChangeRole = (userId: string, newRole: string) => {
    if (onChangeMemberRole) {
      onChangeMemberRole(userId, newRole);
    }
    setRoleMenuOpen(null);
    setShowActionMenuForUser(null);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#4A7B61] mb-3" />
        <p className="text-[#706C66]">Loading members...</p>
      </div>
    );
  }
  
  return (
    <div className="p-1">
      {/* Admins section */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('admins')}
          className="w-full flex items-center justify-between p-4 bg-[#F8F7F2] hover:bg-[#F4F2ED] rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-[#4A7B61] mr-3" />
            <span className="font-medium text-[#2C2925]">Admins</span>
            <span className="ml-2 text-sm text-[#706C66]">({admins.length})</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#706C66] transition-transform ${expandedSection === 'admins' ? 'rotate-180' : ''}`} />
        </button>
        
        {(expandedSection === 'admins' || admins.length <= 3) && (
          <div className="mt-2 space-y-1 animate-fadeIn">
            {admins.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                showActionMenu={showActionMenuForUser === member.user_id}
                toggleActionMenu={() => 
                  setShowActionMenuForUser(
                    showActionMenuForUser === member.user_id ? null : member.user_id
                  )
                }
                roleMenuOpen={roleMenuOpen === member.user_id}
                toggleRoleMenu={() => 
                  setRoleMenuOpen(
                    roleMenuOpen === member.user_id ? null : member.user_id
                  )
                }
                confirmRemove={confirmRemove === member.user_id}
                onRemove={() => handleRemoveMember(member.user_id)}
                onChangeRole={(newRole) => handleChangeRole(member.user_id, newRole)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Moderators section */}
      {moderators.length > 0 && (
        <div className="mb-4">
          <button 
            onClick={() => toggleSection('moderators')}
            className="w-full flex items-center justify-between p-4 bg-[#F8F7F2] hover:bg-[#F4F2ED] rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <UserCog className="w-5 h-5 text-[#4A7B61] mr-3" />
              <span className="font-medium text-[#2C2925]">Moderators</span>
              <span className="ml-2 text-sm text-[#706C66]">({moderators.length})</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#706C66] transition-transform ${expandedSection === 'moderators' ? 'rotate-180' : ''}`} />
          </button>
          
          {(expandedSection === 'moderators' || moderators.length <= 3) && (
            <div className="mt-2 space-y-1 animate-fadeIn">
              {moderators.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  showActionMenu={showActionMenuForUser === member.user_id}
                  toggleActionMenu={() => 
                    setShowActionMenuForUser(
                      showActionMenuForUser === member.user_id ? null : member.user_id
                    )
                  }
                  roleMenuOpen={roleMenuOpen === member.user_id}
                  toggleRoleMenu={() => 
                    setRoleMenuOpen(
                      roleMenuOpen === member.user_id ? null : member.user_id
                    )
                  }
                  confirmRemove={confirmRemove === member.user_id}
                  onRemove={() => handleRemoveMember(member.user_id)}
                  onChangeRole={(newRole) => handleChangeRole(member.user_id, newRole)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Regular members section */}
      <div className="mb-4">
        <button 
          onClick={() => toggleSection('members')}
          className="w-full flex items-center justify-between p-4 bg-[#F8F7F2] hover:bg-[#F4F2ED] rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <User className="w-5 h-5 text-[#4A7B61] mr-3" />
            <span className="font-medium text-[#2C2925]">Members</span>
            <span className="ml-2 text-sm text-[#706C66]">({regularMembers.length})</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#706C66] transition-transform ${expandedSection === 'members' ? 'rotate-180' : ''}`} />
        </button>
        
        {(expandedSection === 'members' || regularMembers.length <= 5) && (
          <div className="mt-2 space-y-1 animate-fadeIn">
            {regularMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                showActionMenu={showActionMenuForUser === member.user_id}
                toggleActionMenu={() => 
                  setShowActionMenuForUser(
                    showActionMenuForUser === member.user_id ? null : member.user_id
                  )
                }
                roleMenuOpen={roleMenuOpen === member.user_id}
                toggleRoleMenu={() => 
                  setRoleMenuOpen(
                    roleMenuOpen === member.user_id ? null : member.user_id
                  )
                }
                confirmRemove={confirmRemove === member.user_id}
                onRemove={() => handleRemoveMember(member.user_id)}
                onChangeRole={(newRole) => handleChangeRole(member.user_id, newRole)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* No members message */}
      {members.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-[#706C66]">No members found in this group.</p>
        </div>
      )}
    </div>
  );
};

// Individual member card component
interface MemberCardProps {
  member: GroupMember;
  currentUserId: string | null;
  isAdmin: boolean;
  showActionMenu: boolean;
  toggleActionMenu: () => void;
  roleMenuOpen: boolean;
  toggleRoleMenu: () => void;
  confirmRemove: boolean;
  onRemove: () => void;
  onChangeRole: (newRole: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserId,
  isAdmin,
  showActionMenu,
  toggleActionMenu,
  roleMenuOpen,
  toggleRoleMenu,
  confirmRemove,
  onRemove,
  onChangeRole,
}) => {
  // Determine if current user can manage this member
  const canManage = isAdmin && member.user_id !== currentUserId;
  
  // Role badge style
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#4A7B61]/10 text-[#4A7B61]';
      case 'moderator':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-[#F4F2ED] text-[#706C66]';
    }
  };
  
  return (
    <div className={`p-3 rounded-lg ${member.user_id === currentUserId ? 'bg-[#F8F7F2]' : 'hover:bg-[#F8F7F2]'} transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Member avatar */}
          <Link
            href={`/profile/${member.user.username || 'user'}`}
            className="block relative w-10 h-10 rounded-full overflow-hidden bg-[#F4F2ED] mr-3 shadow-sm hover:opacity-90 transition-opacity"
          >
            {member.user.avatar_url ? (
              <Image
                src={member.user.avatar_url}
                alt={member.user.username || 'User'}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                {(member.user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          
          {/* Member details */}
          <div>
            <div className="flex items-center">
              <Link 
                href={`/profile/${member.user.username || 'user'}`}
                className="font-medium text-[#2C2925] hover:text-[#4A7B61] transition-colors"
              >
                {member.user.full_name || member.user.username || 'User'}
              </Link>
              
              {/* "You" badge if it's the current user */}
              {member.user_id === currentUserId && (
                <span className="ml-2 text-xs bg-[#F4F2ED] text-[#706C66] px-1.5 py-0.5 rounded">You</span>
              )}
            </div>
            
            <div className="flex items-center mt-0.5">
              <span className="text-xs text-[#706C66]">@{member.user.username || 'user'}</span>
              
              {/* Role badge */}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${getRoleBadgeStyle(member.role)}`}>
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action menu */}
        {canManage && (
          <div className="relative">
            <button
              onClick={toggleActionMenu}
              className="p-1.5 rounded-full hover:bg-[#E8E6E1] text-[#706C66]"
            >
              <MoreVertical size={18} />
            </button>
            
            {showActionMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E6E1] rounded-lg shadow-lg z-10 w-48 overflow-hidden animate-fadeIn">
                {/* Change role button */}
                <div className="relative">
                  <button
                    onClick={toggleRoleMenu}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F4F2ED] flex items-center justify-between text-[#2C2925]"
                  >
                    <span>Change Role</span>
                    <ChevronDown className={`w-4 h-4 text-[#706C66] transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {roleMenuOpen && (
                    <div className="px-2 py-1 border-t border-[#E8E6E1] animate-fadeIn">
                      <button
                        onClick={() => onChangeRole('admin')}
                        className={`w-full text-left px-3 py-1.5 my-0.5 rounded hover:bg-[#F4F2ED] flex items-center text-sm ${member.role === 'admin' ? 'bg-[#4A7B61]/10 text-[#4A7B61]' : 'text-[#2C2925]'}`}
                        disabled={member.role === 'admin'}
                      >
                        <Shield size={14} className="mr-2" />
                        Admin
                      </button>
                      <button
                        onClick={() => onChangeRole('moderator')}
                        className={`w-full text-left px-3 py-1.5 my-0.5 rounded hover:bg-[#F4F2ED] flex items-center text-sm ${member.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'text-[#2C2925]'}`}
                        disabled={member.role === 'moderator'}
                      >
                        <UserCog size={14} className="mr-2" />
                        Moderator
                      </button>
                      <button
                        onClick={() => onChangeRole('member')}
                        className={`w-full text-left px-3 py-1.5 my-0.5 rounded hover:bg-[#F4F2ED] flex items-center text-sm ${member.role === 'member' ? 'bg-[#F4F2ED] text-[#706C66]' : 'text-[#2C2925]'}`}
                        disabled={member.role === 'member'}
                      >
                        <User size={14} className="mr-2" />
                        Member
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Remove member button */}
                <button
                  onClick={onRemove}
                  className={`w-full text-left px-4 py-2.5 flex items-center ${
                    confirmRemove ? 'bg-red-50 text-red-600' : 'hover:bg-[#F4F2ED] text-[#2C2925]'
                  }`}
                >
                  <UserMinus size={16} className={`mr-2 ${confirmRemove ? 'text-red-500' : 'text-[#706C66]'}`} />
                  {confirmRemove ? 'Confirm Remove' : 'Remove from Group'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembers; 