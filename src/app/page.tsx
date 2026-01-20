'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderPlus, Edit2, Trash2, Settings } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { DocumentCard } from '@/components/DocumentCard';
import { Modal, ConfirmModal } from '@/components/Modal';
import { ToastContainer } from '@/components/Toast';
import { ToastProvider, useToast } from '@/hooks/useToast';
import { useAdmin } from '@/hooks/useAdmin';
import { IconPicker, IconByName } from '@/components/IconPicker';
import { getAuthHeaders } from '@/lib/api';
import type { Category, DocumentWithCategory } from '@/types/database';

function HomePage() {
  const { isAdmin } = useAdmin();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentWithCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCatDeleteModal, setShowCatDeleteModal] = useState(false);
  const [showCatListModal, setShowCatListModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentWithCategory | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentWithCategory | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  // Form states
  const [docForm, setDocForm] = useState({
    title: '',
    slug: '',
    category_id: '',
    meta_description: '',
    published: true,
    featured: false,
  });
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    icon: 'package',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, docRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/documents${activeCategory ? `?category=${activeCategory}` : ''}`),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (docRes.ok) {
        const docData = await docRes.json();
        setDocuments(docData.documents || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      error('Gagal Memuat Data', 'Periksa koneksi internet kamu.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle document save
  const handleSaveDocument = async () => {
    try {
      const method = editingDoc ? 'PATCH' : 'POST';
      const body = editingDoc
        ? { id: editingDoc.id, ...docForm }
        : docForm;

      const res = await fetch('/api/documents', {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        success('Berhasil', editingDoc ? 'Dokumen diperbarui' : 'Dokumen dibuat');
        setShowDocModal(false);
        setEditingDoc(null);
        setDocForm({ title: '', slug: '', category_id: '', meta_description: '', published: true, featured: false });
        fetchData();
      } else {
        const data = await res.json();
        error('Gagal', data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error saving document:', err);
      error('Gagal', 'Tidak dapat menyimpan dokumen');
    }
  };

  // Handle category save
  const handleSaveCategory = async () => {
    try {
      const method = editingCat ? 'PATCH' : 'POST';
      const body = editingCat
        ? { id: editingCat.id, ...catForm }
        : catForm;

      const res = await fetch('/api/categories', {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        success('Berhasil', editingCat ? 'Kategori diperbarui' : 'Kategori dibuat');
        setShowCatModal(false);
        setEditingCat(null);
        setCatForm({ name: '', slug: '', icon: 'package' });
        fetchData();
      } else {
        const data = await res.json();
        error('Gagal', data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      error('Gagal', 'Tidak dapat menyimpan kategori');
    }
  };

  // Handle document delete
  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;

    try {
      const res = await fetch(`/api/documents?id=${deletingDoc.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        success('Berhasil', 'Dokumen dihapus');
        setShowDeleteModal(false);
        setDeletingDoc(null);
        fetchData();
      } else {
        const data = await res.json();
        error('Gagal', data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      error('Gagal', 'Tidak dapat menghapus dokumen');
    }
  };

  // Handle category delete
  const handleDeleteCategory = async () => {
    if (!deletingCat) return;

    try {
      const res = await fetch(`/api/categories?id=${deletingCat.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        success('Berhasil', 'Kategori dihapus');
        setShowCatDeleteModal(false);
        setDeletingCat(null);
        fetchData();
      } else {
        const data = await res.json();
        error('Gagal', data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      error('Gagal', 'Tidak dapat menghapus kategori');
    }
  };

  // Handle edit click - document
  const handleEditClick = (doc: DocumentWithCategory) => {
    setEditingDoc(doc);
    setDocForm({
      title: doc.title,
      slug: doc.slug,
      category_id: doc.category_id || '',
      meta_description: doc.meta_description || '',
      published: doc.published,
      featured: doc.featured,
    });
    setShowDocModal(true);
  };

  // Handle delete click - document
  const handleDeleteClick = (doc: DocumentWithCategory) => {
    setDeletingDoc(doc);
    setShowDeleteModal(true);
  };

  // Handle edit click - category
  const handleEditCatClick = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
    });
    setShowCatListModal(false);
    setShowCatModal(true);
  };

  // Handle delete click - category
  const handleDeleteCatClick = (cat: Category) => {
    setDeletingCat(cat);
    setShowCatListModal(false);
    setShowCatDeleteModal(true);
  };

  return (
    <>
      <Header categories={categories} />

      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Hero Section */}
        <div className="hero">
          <h1 className="hero-title">Dokumentasi Easy.Store</h1>
          <p className="hero-subtitle">Temukan tutorial dan panduan untuk semua produk kami</p>
          <SearchBar isHero placeholder="Cari tutorial, panduan, FAQ..." />
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.slug)}
            >
              <IconByName name={cat.icon} size={16} /> {cat.name}
            </button>
          ))}

          {isAdmin && (
            <>
              <button
                className="category-tab"
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ name: '', slug: '', icon: 'package' });
                  setShowCatModal(true);
                }}
                style={{ borderStyle: 'dashed' }}
              >
                <FolderPlus size={16} />
                Tambah
              </button>
              <button
                className="category-tab"
                onClick={() => setShowCatListModal(true)}
                title="Kelola Kategori"
              >
                <Settings size={16} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingDoc(null);
                  setDocForm({ title: '', slug: '', category_id: '', meta_description: '', published: true, featured: false });
                  setShowDocModal(true);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <Plus size={16} />
                Tambah Dokumen
              </button>
            </>
          )}
        </div>

        {/* Document Grid */}
        {isLoading ? (
          <div className="document-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="skeleton card-thumbnail" />
                <div className="card-body">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="document-grid">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
            <p>Belum ada dokumen.</p>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => setShowDocModal(true)}
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                <Plus size={16} />
                Buat Dokumen Pertama
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Modal */}
      <Modal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setEditingDoc(null);
        }}
        title={editingDoc ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDocModal(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSaveDocument}>
              {editingDoc ? 'Simpan Perubahan' : 'Buat Dokumen'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Judul</label>
          <input
            type="text"
            className="form-input"
            value={docForm.title}
            onChange={(e) => {
              setDocForm({
                ...docForm,
                title: e.target.value,
                slug: editingDoc ? docForm.slug : generateSlug(e.target.value),
              });
            }}
            placeholder="Contoh: Cara Aktivasi YouTube Premium"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Slug (URL)</label>
          <input
            type="text"
            className="form-input"
            value={docForm.slug}
            onChange={(e) => setDocForm({ ...docForm, slug: e.target.value })}
            placeholder="cara-aktivasi-youtube-premium"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select
            className="form-input form-select"
            value={docForm.category_id}
            onChange={(e) => setDocForm({ ...docForm, category_id: e.target.value })}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi (SEO)</label>
          <textarea
            className="form-input form-textarea"
            value={docForm.meta_description}
            onChange={(e) => setDocForm({ ...docForm, meta_description: e.target.value })}
            placeholder="Deskripsi singkat untuk hasil pencarian..."
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={docForm.published}
              onChange={(e) => setDocForm({ ...docForm, published: e.target.checked })}
            />
            <span>Publikasikan</span>
          </label>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={docForm.featured}
              onChange={(e) => setDocForm({ ...docForm, featured: e.target.checked })}
            />
            <span>Tampilkan di Atas</span>
          </label>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCatModal}
        onClose={() => {
          setShowCatModal(false);
          setEditingCat(null);
        }}
        title={editingCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCatModal(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSaveCategory}>
              {editingCat ? 'Simpan Perubahan' : 'Buat Kategori'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nama Kategori</label>
          <input
            type="text"
            className="form-input"
            value={catForm.name}
            onChange={(e) => setCatForm({
              ...catForm,
              name: e.target.value,
              slug: editingCat ? catForm.slug : generateSlug(e.target.value),
            })}
            placeholder="Contoh: YouTube Premium"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Slug</label>
          <input
            type="text"
            className="form-input"
            value={catForm.slug}
            onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
            placeholder="youtube-premium"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <IconPicker
            value={catForm.icon}
            onChange={(icon) => setCatForm({ ...catForm, icon })}
          />
        </div>
      </Modal>

      {/* Category List/Management Modal */}
      <Modal
        isOpen={showCatListModal}
        onClose={() => setShowCatListModal(false)}
        title="Kelola Kategori"
        size="md"
      >
        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-lg)' }}>
            Belum ada kategori.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <IconByName name={cat.icon} size={20} />
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{cat.slug}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEditCatClick(cat)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteCatClick(cat)}
                    title="Hapus"
                    style={{ color: 'var(--error)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Document Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingDoc(null);
        }}
        onConfirm={handleDeleteDocument}
        title="Hapus Dokumen"
        message={`Yakin ingin menghapus "${deletingDoc?.title}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={showCatDeleteModal}
        onClose={() => {
          setShowCatDeleteModal(false);
          setDeletingCat(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus kategori "${deletingCat?.name}"? Semua dokumen dalam kategori ini akan kehilangan kategorinya.`}
      />

      <ToastContainer />
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomePage />
    </ToastProvider>
  );
}
