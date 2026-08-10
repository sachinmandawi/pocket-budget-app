import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save, MoreVertical, Edit2, Check, X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../utils/storage';

export default function CategoriesSettingsPage({ data, onSaveSettings, onBack }) {
  const [categories, setCategories] = useState(data.categories || DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

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
      alert('Must keep at least one category!');
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

  const handleSaveEdit = (id) => {
    if (!editName.trim()) return;
    setCategories(categories.map(c => {
      if (c.id === id) {
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
      <form onSubmit={handleSubmit} className="ios-card">
        <label className="form-label" style={{ marginBottom: '10px' }}>Active Categories</label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
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
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--ios-blue-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--ios-blue)'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '56px', textAlign: 'center', fontSize: '18px', padding: '6px' }}
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    maxLength={3}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontSize: '14px', padding: '6px 10px' }}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(cat.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <X size={16} />
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
                  padding: '12px 14px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: cat.color || '#2563eb'
                  }} />

                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={() => setOpenMenuId(isMenuOpen ? null : cat.id)} 
                      className="btn btn-secondary btn-sm"
                      style={{ width: '34px', height: '34px', padding: 0 }}
                    >
                      <MoreVertical size={16} color="var(--text-secondary)" />
                    </button>

                    {isMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '40px',
                        zIndex: 50,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minWidth: '110px',
                        animation: 'fadeIn 0.15s ease-out'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                          className="menu-item-hover"
                        >
                          <Edit2 size={14} color="var(--ios-blue)" /> Edit
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--ios-red)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%'
                          }}
                          className="menu-item-hover"
                        >
                          <Trash2 size={14} color="var(--ios-red)" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Category Section */}
        <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            ➕ New Category
          </span>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Emoji"
              className="form-input"
              style={{ width: '70px', fontSize: '18px', textAlign: 'center' }}
              maxLength={3}
              value={newCatIcon}
              onChange={e => setNewCatIcon(e.target.value)}
            />
            <input
              type="text"
              placeholder="Category Title"
              className="form-input"
              style={{ flex: 1, fontSize: '14px' }}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
            />
          </div>
          
          <button type="button" onClick={handleAddCategory} className="btn btn-secondary btn-sm" style={{ width: '100%', padding: '10px' }}>
            <Plus size={16} /> Add Category
          </button>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
          <Save size={18} /> Save Changes
        </button>
      </form>
    </div>
  );
}
