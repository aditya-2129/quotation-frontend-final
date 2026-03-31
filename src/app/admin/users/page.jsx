"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authService } from '@/services/auth';
import { userService } from '@/services/users';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Create User form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  // Redirect non-admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/quotations');
    }
  }, [authLoading, isAdmin, router]);

  // Load users
  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await userService.listUsers(100, 0);
      setUsers(response.documents || []);
    } catch (err) {
      setError('Failed to load users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Flash success message
  function flashSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  // Create user
  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');

    const { name, email, password, mobile, role } = formData;
    if (!name.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setFormError('Enter a valid mobile number (at least 10 digits).');
      return;
    }

    try {
      setFormLoading(true);

      // 1. Create Appwrite auth account via server API
      const authUser = await authService.createAuthAccount(email.trim(), password, name.trim());

      // 2. Create profile in users collection
      await userService.createUser({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        role: role,
        auth_id: authUser.userId
      });

      // Reset form & reload
      setFormData({ name: '', email: '', password: '', mobile: '', role: 'user' });
      setShowForm(false);
      flashSuccess(`User "${name.trim()}" created successfully.`);
      await loadUsers();
    } catch (err) {
      console.error('Create user failed:', err);
      if (err?.message?.includes('already exists') || err?.code === 409) {
        setFormError('A user with this email already exists.');
      } else {
        setFormError(err?.message || 'Failed to create user. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  }

  // Start editing
  function startEdit(user) {
    setEditingId(user.$id);
    setEditData({ name: user.name, mobile: user.mobile, role: user.role });
  }

  // Save edit
  async function handleSaveEdit(docId) {
    try {
      await userService.updateUser(docId, {
        name: editData.name,
        mobile: editData.mobile,
        role: editData.role
      });
      setEditingId(null);
      flashSuccess('User updated successfully.');
      await loadUsers();
    } catch (err) {
      console.error('Update user failed:', err);
      setError('Failed to update user.');
    }
  }

  // Delete user
  async function handleDeleteUser(docId) {
    try {
      await userService.deleteUser(docId);
      setDeletingId(null);
      flashSuccess('User deleted successfully.');
      await loadUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
      setError('Failed to delete user.');
    }
  }

  if (authLoading || !isAdmin) return null;

  return (
    <DashboardLayout title="User Management">
      <div className="flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Team Members</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              {users.length} user{users.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 text-[13px] font-bold text-zinc-950 shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-95 border border-brand-primary/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] font-medium text-emerald-700">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] font-medium text-red-600">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Create User Form */}
        {showForm && (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-900 mb-5">Create New User</h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@kaivalyaengineering.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 99224 42211"
                  maxLength={15}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-3.5 text-sm text-zinc-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                {formError && (
                  <p className="text-sm text-red-500 font-medium flex-1">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-[13px] font-bold text-zinc-950 shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-3 border-zinc-200 border-t-brand-primary animate-spin" />
              <span className="text-xs text-zinc-400 font-medium">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-400">No users found. Create the first user above.</p>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="w-[22%] px-6 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Name</th>
                  <th className="w-[28%] px-6 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Email</th>
                  <th className="w-[18%] px-6 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Mobile</th>
                  <th className="w-[12%] px-6 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Role</th>
                  <th className="w-[20%] px-6 py-3.5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <tr key={user.$id} className="hover:bg-zinc-50/50 transition-colors">
                    {editingId === user.$id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-zinc-400">{user.email}</span>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="tel"
                            value={editData.mobile}
                            onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-brand-primary focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(user.$id)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15 text-[11px] font-black text-brand-primary">
                              {user.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-zinc-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-500">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-zinc-500 font-mono">{user.mobile}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {deletingId === user.$id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-red-500 mr-2">Delete?</span>
                              <button
                                onClick={() => handleDeleteUser(user.$id)}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                                title="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeletingId(user.$id)}
                                className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:border-red-300 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const newPass = prompt(`Enter new password for ${user.name}:`);
                                  if (newPass && newPass.length >= 8) {
                                    authService.resetUserPassword(user.auth_id, newPass)
                                      .then(() => flashSuccess(`Password for ${user.name} has been reset.`))
                                      .catch(err => setError(err.message));
                                  } else if (newPass) {
                                    alert('Password must be at least 8 characters.');
                                  }
                                }}
                                className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
                                title="Reset Password"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
