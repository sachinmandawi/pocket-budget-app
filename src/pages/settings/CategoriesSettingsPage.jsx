import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, MoreVertical, Edit2, Check, X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../utils/storage';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

export default function CategoriesSettingsPage({ data, onSaveSettings, onBack }) {
  const [categories, setCategories] = useState(data.categories || DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (data && data.categories) {
      setCategories(data.categories);
    }
  }, [data?.categories]);

  // Close 3-dot popup menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-category-menu]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [openMenuId]);

  const presetColors = ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const catId = 'custom_' + Date.now();
    const assignedColor = presetColors[categories.length % presetColors.length];
    setCategories([
      ...categories,
      { id: catId, name: newCatName.trim(), icon: newCatIcon || '🏷️', color: assignedColor }
    ]);
    setNewCatName('');
  };

  const handleRemoveCategory = (id) => {
    if (categories.length <= 1) {
      setErrorMsg('Must keep at least one category!');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    setOpenMenuId(null);
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setOpenMenuId(null);
  };

  const handleSaveEdit = (catId) => {
    if (!editName.trim()) return;
    setCategories(categories.map(c => {
      if (c.id === catId) {
        return { ...c, name: editName.trim(), icon: editIcon || '🏷️' };
      }
      return c;
    }));
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...data,
      categories
    });
    onBack();
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <form onSubmit={handleSubmit} className="notion-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Category Manager
          </span>
          <span className="notion-tag notion-tag-gray">
            {categories.length} Categories
          </span>
        </div>
        
        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {categories.map(cat => {
            const isEditing = editingId === cat.id;
            const isMenuOpen = openMenuId === cat.id;

            if (isEditing) {
              return (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '48px', textAlign: 'center', fontSize: '16px', padding: '4px' }}
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    maxLength={3}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontSize: '13px', padding: '6px 8px' }}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(cat.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '28px', height: '28px', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden', marginRight: '8px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{cat.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{cat.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: cat.color || 'var(--text-tertiary)'
                  }} />

                  <div style={{ position: 'relative', zIndex: isMenuOpen ? 90 : 1 }} data-category-menu={cat.id}>
                    <button 
                      type="button" 
                      onClick={() => setOpenMenuId(isMenuOpen ? null : cat.id)} 
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        padding: 0,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="More options"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {isMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '28px',
                        zIndex: 100,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        minWidth: '110px',
                        animation: 'fadeIn 0.12s ease-out'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 8px',
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                        >
                          <Edit2 size={13} color="var(--text-secondary)" /> Edit
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setCatToDelete(cat);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 8px',
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--notion-red-text)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                        >
                          <Trash2 size={13} color="var(--notion-red-text)" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Category Box */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            + Add New Category
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: '6px' }}>
            <input
              type="text"
              className="form-input"
              style={{ textAlign: 'center', fontSize: '16px', padding: '4px' }}
              value={newCatIcon}
              onChange={e => setNewCatIcon(e.target.value)}
              maxLength={3}
            />
            <input
              type="text"
              placeholder="Category Name"
              className="form-input"
              style={{ fontSize: '12px' }}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0 10px', fontSize: '12px' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="notion-callout" style={{
            marginBottom: '12px',
            background: 'var(--notion-red-bg)',
            color: 'var(--notion-red-text)',
            fontSize: '11px',
            fontWeight: 600
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
          <Save size={15} /> Save Changes
        </button>
      </form>

      {/* Modern Delete Category Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!catToDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete the "${catToDelete?.name}" category?`}
        confirmText="Delete Category"
        cancelText="Cancel"
        onConfirm={() => {
          if (catToDelete?.id) {
            handleRemoveCategory(catToDelete.id);
          }
        }}
        onClose={() => setCatToDelete(null)}
      />
    </div>
  );
}
