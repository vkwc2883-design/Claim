import React, { useState, useEffect } from 'react';
import { UserAccount, getUsers, saveUserToDirectory } from '../services/authService';
import { Users, UserPlus, Lock, Key, Shield, Check, X, LogIn, UserCheck } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'login' | 'directory' | 'register'>('login');
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // New user registration state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newIcNo, setNewIcNo] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'supervisor' | 'director'>('staff');
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const list = await getUsers();
    setUsers(list);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const found = users.find(
      u => u.username.toLowerCase() === loginUsername.trim().toLowerCase()
    );

    if (!found) {
      setLoginError('Username not found. Check directory or register a new user.');
      return;
    }

    if (found.password && found.password !== loginPassword) {
      setLoginError('Incorrect password.');
      return;
    }

    onLogin(found);
    onClose();
  };

  const handleQuickSelect = (user: UserAccount) => {
    onLogin(user);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newName || !newIcNo) {
      alert('Please fill in username, name, and IC number.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      username: newUsername.trim(),
      password: newPassword.trim() || 'password123',
      name: newName.trim().toUpperCase(),
      icNo: newIcNo.trim(),
      role: newRole,
    };

    await saveUserToDirectory(newUser);
    await loadUsers();
    setRegSuccess(true);
    onLogin(newUser);
    setTimeout(() => {
      setRegSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">User Management & Staff Login</h3>
              <p className="text-xs text-slate-500">Auto-prefills Claim Form Name and IC Number on login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 space-x-3 bg-white">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In / Switch User
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Staff Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-slate-50 max-h-[75vh] overflow-y-auto">
          {/* Tab 1: Login */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {currentUser && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Currently Logged In</span>
                      <h4 className="font-bold text-slate-900 text-xs">{currentUser.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">IC: {currentUser.icNo} | Username: {currentUser.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded font-bold uppercase">
                    {currentUser.role || 'staff'}
                  </span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Sign In With Credentials</h4>
                
                {loginError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. ahmad, siti, weichen"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In & Prefill Claim Form
                </button>
              </form>

              {/* Quick Select Buttons */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Switch Staff Account</h5>
                <div className="grid grid-cols-1 gap-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleQuickSelect(u)}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-orange-500 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-orange-100 text-slate-700 group-hover:text-orange-600 font-bold flex items-center justify-center text-xs transition-colors">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs group-hover:text-orange-600 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Username: {u.username} | IC: {u.icNo}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Select <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Directory */}
          {activeTab === 'directory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Registered Staff Accounts</h4>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-bold"
                >
                  + Add User
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {users.map((u) => (
                  <div key={u.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          @{u.username}
                        </span>
                        <span className="text-[9px] uppercase font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                          {u.role || 'staff'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        IC NO : <span className="text-slate-800 font-bold">{u.icNo}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickSelect(u)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Login As
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Register New User */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Create New User Account</h4>

              {regSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  User created and logged in successfully!
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Username *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. zulkarnain"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name (As per IC) *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. ZULKARNAIN BIN IDRIS"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">IC Number *</label>
                <input
                  type="text"
                  value={newIcNo}
                  onChange={(e) => setNewIcNo(e.target.value)}
                  placeholder="e.g. 910412-08-5119"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Role / Designation</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="staff">Staff / Claim Claimant</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="director">Director</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Save & Login User
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
