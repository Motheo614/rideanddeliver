'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Save, Eye, Upload, X, ChevronDown, ChevronUp, Link2, Search, Move } from 'lucide-react';
import { marked } from 'marked';
import 'react-quill-new/dist/quill.snow.css';
import '@/app/quill-custom.css';
import { generateSlugFromTitle } from '@/lib/slug';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
const ReactQuillEditor = ReactQuill as any;
const SELECTED_TABLE_CLASS = 'rs-selected-table';
const PRODUCT_BLOCK_KEY = 'product-block';

interface Post {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category: string;
  categoryLabel?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  readTime?: number;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  seoMetadata?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  cta?: {
    enabled: boolean;
    title?: string;
    description?: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
}

interface PostEditorProps {
  post?: Post;
  mode: 'create' | 'edit';
}

interface ProductListItem {
  _id: string;
  productName?: string;
  name?: string;
  asin?: string;
  affiliateLink?: string;
  price?: string;
  imageUrl?: string;
  description?: string;
  pros?: string[];
}

type ProductBlockType = 'accent' | 'hero';

const PRODUCT_BLOCK_STYLE = 'margin:18px 0; padding: 12px 16px; border-left: 4px solid #CC0000; background: #fff8f8; border-radius: 0 6px 6px 0; font-size: 13px; font-weight: 700; color: #CC0000; text-transform: uppercase; letter-spacing: 0.05em; cursor: default; user-select: none;';

const ensureProductBlockBlotRegistered = (QuillCtor: any) => {
  if (!QuillCtor || QuillCtor.__productBlockBlotRegistered) return;

  const BlockEmbed = QuillCtor.import('blots/block/embed');

  class ProductBlockBlot extends BlockEmbed {
    static blotName = PRODUCT_BLOCK_KEY;
    static tagName = 'div';
    static className = 'product-block-blot';

    static create(value: any) {
      const node = super.create() as HTMLElement;
      const blockType = String(value?.blockType || 'accent').toLowerCase() === 'hero' ? 'hero' : 'accent';
      const productId = String(value?.productId || '').trim().toLowerCase();
      const productName = String(value?.productName || 'Product').trim();
      const borderColor = blockType === 'hero' ? '#CC0000' : '#9ca3af';

      node.setAttribute('data-product-block', 'true');
      node.setAttribute('data-block-type', blockType);
      if (productId) {
        node.setAttribute('data-product-id', productId);
      }
      node.setAttribute('contenteditable', 'false');
      node.setAttribute('style', PRODUCT_BLOCK_STYLE.replace('border-left: 4px solid #CC0000;', `border-left: 4px solid ${borderColor};`));
      node.textContent = `${blockType === 'hero' ? '★ Hero Card' : 'Accent Card'} — ${productName}`;
      return node;
    }

    static value(node: HTMLElement) {
      const blockType = String(node.getAttribute('data-block-type') || 'accent').toLowerCase() === 'hero' ? 'hero' : 'accent';
      const productId = String(node.getAttribute('data-product-id') || '').trim().toLowerCase();
      const text = String(node.textContent || '').trim();
      const productName = text
        .replace(/^★\s*Hero Card\s*—\s*/i, '')
        .replace(/^Accent Card\s*—\s*/i, '')
        .trim();

      return {
        blockType,
        productId,
        productName,
      };
    }
  }

  QuillCtor.register(ProductBlockBlot, true);
  QuillCtor.__productBlockBlotRegistered = true;
};

const categoryOptions = [
  { value: 'safety-gear', label: 'Safety Gear' },
  { value: 'tech-lighting', label: 'Tech & Lighting' },
  { value: 'bike-security', label: 'Bike Security' },
  { value: 'delivery-gear', label: 'Delivery Gear' },
  { value: 'platform-reviews', label: 'Platform Reviews' },
];

const normalizeCategoryValue = (value?: string) => {
  if (!value) return '';

  // Already a valid enum slug
  if (categoryOptions.some((opt) => opt.value === value)) {
    return value;
  }

  // Convert display label (e.g. "Safety Gear") to enum slug
  const byLabel = categoryOptions.find((opt) => opt.label.toLowerCase() === value.toLowerCase());
  if (byLabel) {
    return byLabel.value;
  }

  return value;
};

export default function PostEditor({ post, mode }: PostEditorProps) {
  const quillRef = useRef<any>(null);
  const quillInstanceRef = useRef<any>(null);
  const savedSelectionRef = useRef<any>(null);
  const selectedTableElementRef = useRef<HTMLElement | null>(null);
  const selectedTableIndexRef = useRef<number>(-1);
  const hoveredTableElementRef = useRef<HTMLElement | null>(null);
  const selectorTargetTableRef = useRef<HTMLElement | null>(null);
  const tableSelectorHoveredRef = useRef(false);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [seoCollapsed, setSeoCollapsed] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [markdownUploading, setMarkdownUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [linkSearchResults, setLinkSearchResults] = useState<any[]>([]);
  const [linkSearching, setLinkSearching] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<ProductListItem[]>([]);
  const [productSearching, setProductSearching] = useState(false);
  const [tableSelected, setTableSelected] = useState(false);
  const [tableSelectorUI, setTableSelectorUI] = useState({
    visible: false,
    top: 0,
    left: 0,
  });
  
  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const initialContent = post?.content || '';
  const [content] = useState(initialContent);
  const contentRef = useRef<string>(initialContent);
  const [imageUrl, setImageUrl] = useState(post?.featuredImage?.url || '');
  const [imageAlt, setImageAlt] = useState(post?.featuredImage?.alt || '');
  const [category, setCategory] = useState(normalizeCategoryValue(post?.category));
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(post?.status || 'draft');
  const [featured, setFeatured] = useState(post?.featured || false);
  const [trending, setTrending] = useState(post?.trending || false);
  const [editorsPick, setEditorsPick] = useState(post?.editorsPick || false);
  const [metaTitle, setMetaTitle] = useState(post?.seoMetadata?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.seoMetadata?.metaDescription || '');
  const [keywords, setKeywords] = useState(post?.seoMetadata?.keywords?.join(', ') || '');
  const [ctaEnabled, setCtaEnabled] = useState(Boolean(post?.cta?.enabled));
  const [ctaTitle, setCtaTitle] = useState(post?.cta?.title || 'Ready To Upgrade Your Riding Gear?');
  const [ctaDescription, setCtaDescription] = useState(post?.cta?.description || 'Check the latest prices and deals before your next shift.');
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState(post?.cta?.primaryHref || '');
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(post?.cta?.primaryLabel || 'Compare All Options on Amazon');
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(post?.cta?.secondaryHref || '');
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(post?.cta?.secondaryLabel || 'View More Gloves on RevZilla');

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (mode === 'create') {
      setSlug(generateSlugFromTitle(value));
    }
  };

  const getQuillInstance = () => {
    let quill = quillInstanceRef.current;

    // Hot reloads/remounts can leave a stale detached Quill instance cached.
    if (quill && quill.root && !quill.root.isConnected) {
      quill = null;
      quillInstanceRef.current = null;
    }

    if (!quill && quillRef.current?.getEditor) {
      try {
        quill = quillRef.current.getEditor();
        if (quill) {
          quillInstanceRef.current = quill;
        }
      } catch (error) {
        console.error('Unable to access Quill editor from ref:', error);
      }
    }

    if (!quill) {
      const container = document.getElementById('quill-container');
      const reactQuillElement = container?.querySelector('.ql-container') as any;
      if (reactQuillElement && reactQuillElement.__quill) {
        quill = reactQuillElement.__quill;
        quillInstanceRef.current = quill;
      }
    }

    return quill;
  };

  const openInternalLinkModal = () => {
    setShowLinkModal(true);
    setLinkSearchQuery('');
    setLinkSearchResults([]);
  };

  const getSafeRange = (quill: any) => {
    if (!quill) return null;

    const focusedRange = quill.getSelection?.(true);
    if (focusedRange && typeof focusedRange.index === 'number') {
      return focusedRange;
    }

    const currentRange = quill.getSelection?.();
    if (currentRange && typeof currentRange.index === 'number') {
      return currentRange;
    }

    return {
      index: Math.max(0, (quill.getLength?.() || 1) - 1),
      length: 0,
    };
  };

  const clearTableSelection = () => {
    const selected = selectedTableElementRef.current;
    if (selected) {
      selected.style.outline = '';
      selected.style.outlineOffset = '';
      selected.classList.remove(SELECTED_TABLE_CLASS);
    }

    const editorContainer = document.getElementById('quill-container');
    if (editorContainer) {
      const markedTables = editorContainer.querySelectorAll(`.${SELECTED_TABLE_CLASS}`);
      markedTables.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.classList.remove(SELECTED_TABLE_CLASS);
      });
    }

    selectedTableElementRef.current = null;
    selectedTableIndexRef.current = -1;
    setTableSelected(false);
  };

  const getSelectableTables = (container?: HTMLElement | null) => {
    const editorContainer = container || (document.getElementById('quill-container') as HTMLElement | null);
    if (!editorContainer) return [] as HTMLElement[];

    const wrappers = Array.from(editorContainer.querySelectorAll('.table-wrapper')) as HTMLElement[];
    const standaloneTables = Array.from(editorContainer.querySelectorAll('table'))
      .filter((table) => !table.closest('.table-wrapper')) as HTMLElement[];

    return [...wrappers, ...standaloneTables];
  };

  const resolveTableElement = (node: Node | null) => {
    const target = (node instanceof HTMLElement ? node : node?.parentElement) || null;
    if (!target) return null;

    const tableWrapper = target.closest('.table-wrapper') as HTMLElement | null;
    const table = target.closest('table') as HTMLElement | null;
    const cell = target.closest('td, th') as HTMLElement | null;
    const row = target.closest('tr') as HTMLElement | null;
    const section = target.closest('tbody, thead, tfoot') as HTMLElement | null;

    return (tableWrapper || table || cell?.closest('table') || row?.closest('table') || section?.closest('table')) as HTMLElement | null;
  };

  const selectTableElement = (tableElement: HTMLElement | null) => {
    if (!tableElement) {
      showToast('No table found to select.', 'error');
      return;
    }

    clearTableSelection();
    const candidates = getSelectableTables();
    selectedTableIndexRef.current = candidates.findIndex((el) => el === tableElement);
    tableElement.classList.add(SELECTED_TABLE_CLASS);
    tableElement.style.outline = '3px solid #CC0000';
    tableElement.style.outlineOffset = '2px';
    selectedTableElementRef.current = tableElement;
    setTableSelected(true);
    showToast('Table selected. Click remove to delete it.', 'success');
  };

  const searchInternalLinks = async (query: string) => {
    if (!query.trim()) {
      setLinkSearchResults([]);
      return;
    }

    setLinkSearching(true);
    try {
      const response = await fetch(`/api/posts?search=${encodeURIComponent(query)}&limit=10`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLinkSearchResults(data.posts || []);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLinkSearching(false);
    }
  };

  const searchProducts = async (query: string) => {
    setProductSearching(true);
    try {
      const params = new URLSearchParams({ includeInactive: 'true' });
      if (query.trim()) {
        params.set('search', query.trim());
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProductSearchResults((data.products || []).slice(0, 12));
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSearchResults([]);
    } finally {
      setProductSearching(false);
    }
  };

  const insertProductBlock = (product: ProductListItem, blockType: ProductBlockType) => {
    const quill = getQuillInstance();

    if (!quill) {
      showToast('Editor not ready. Please try again.', 'error');
      return;
    }

    const name = (product.productName || product.name || '').trim();
    if (!name || !product._id) {
      showToast('Product is missing required metadata.', 'error');
      return;
    }

    const QuillCtor = quill.constructor as any;
    ensureProductBlockBlotRegistered(QuillCtor);

    if (!(quill as any).__productBlockMatcherRegistered) {
      const DeltaCtor = QuillCtor.import('delta');
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node: Node, delta: any) => {
        if ((quill as any).__skipProductBlockMatcher) {
          return delta;
        }

        if (!(node instanceof HTMLElement)) {
          return delta;
        }

        const isProductBlockNode = node.matches('div[data-product-block], div.product-block-blot[data-product-id]');
        if (!isProductBlockNode) {
          return delta;
        }

        const matchedBlockType = String(node.getAttribute('data-block-type') || 'accent').toLowerCase() === 'hero' ? 'hero' : 'accent';
        const matchedProductId = String(node.getAttribute('data-product-id') || '').trim().toLowerCase();

        if (!matchedProductId) {
          return delta;
        }

        const text = String(node.textContent || '').trim();
        const productName = text
          .replace(/^★\s*Hero Card\s*—\s*/i, '')
          .replace(/^Accent Card\s*—\s*/i, '')
          .trim();

        return new DeltaCtor()
          .insert({ [PRODUCT_BLOCK_KEY]: { blockType: matchedBlockType, productId: matchedProductId, productName } })
          .insert('\n');
      });
      (quill as any).__productBlockMatcherRegistered = true;
    }

    const normalizedProductId = String(product._id || '').trim().toLowerCase();
    const isHero = blockType === 'hero';
    const borderColor = isHero ? '#CC0000' : '#9ca3af';
    const safeProductName = name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const productHtml = `<div class="product-block-blot" data-product-block="true" data-block-type="${blockType}" data-product-id="${normalizedProductId}" contenteditable="false" style="${PRODUCT_BLOCK_STYLE.replace('border-left: 4px solid #CC0000;', `border-left: 4px solid ${borderColor};`)}">${blockType === 'hero' ? '★ Hero Card' : 'Accent Card'} — ${safeProductName}</div><p><br></p>`;

    const range = getSafeRange(quill);
    const insertIndex = range ? range.index : Math.max(0, quill.getLength() - 1);

    // Guard against late editor hydration replacing newly inserted blocks.
    (quill as any).__loadedPostContentId = post?._id || 'create';

    (quill as any).__skipProductBlockMatcher = true;
    quill.clipboard.dangerouslyPasteHTML(insertIndex, productHtml, 'user');
    (quill as any).__skipProductBlockMatcher = false;
    contentRef.current = String(quill.root?.innerHTML || '');
    console.log('POST-PASTE HTML:', quill.root.innerHTML);
    quill.focus();
    quill.setSelection(insertIndex + 1, 0, 'silent');
    showToast(`Inserted ${name} as ${isHero ? 'Hero Card' : 'Accent Card'}`, 'success');
  };

  const handleEditorChange = (value: string) => {
    contentRef.current = value;
  };

  const normalizePathSegment = (value: unknown) => {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const getCanonicalInternalPostPath = (post: any) => {
    const categorySlug = normalizePathSegment(post?.dbCategorySlug || post?.categorySlug || post?.category || '');
    const postSlug = normalizePathSegment(post?.slug || '');

    if (!categorySlug || !postSlug) return '';
    return `/${categorySlug}/${postSlug}`;
  };

  const insertInternalLink = (selectedPost: any) => {
    console.log('insertInternalLink called', selectedPost);
    console.log('Stored quill instance:', quillInstanceRef.current);

    const quill = getQuillInstance();

    if (!quill) {
      console.error('Quill editor not found');
      showToast('Editor not ready. Please try again.', 'error');
      return;
    }

    try {
      // Use saved selection (from when modal was opened)
      let range = savedSelectionRef.current;
      console.log('Using saved selection:', range);
      
      if (!range) {
        console.error('No saved selection, using cursor position');
        // If no saved selection, just insert at current cursor or end.
        const fallbackRange = getSafeRange(quill);
        savedSelectionRef.current = fallbackRange;
        range = fallbackRange;
      }

      const selectedText = range && range.length > 0 ? quill.getText(range.index, range.length) : selectedPost.title;
      const linkUrl = getCanonicalInternalPostPath(selectedPost);

      if (!linkUrl) {
        showToast('Selected post is missing a valid category or slug.', 'error');
        return;
      }
      
      console.log('Inserting link:', { selectedText, linkUrl, range });
      
      if (range && range.length > 0) {
        quill.deleteText(range.index, range.length);
      }
      
      const insertIndex = range ? range.index : Math.max(0, quill.getLength() - 1);
      quill.insertText(insertIndex, selectedText, 'link', linkUrl);
      quill.setSelection(insertIndex + selectedText.length, 0, 'silent');
      
      console.log('Link inserted successfully');
      setShowLinkModal(false);
      showToast('Internal link added successfully!', 'success');
    } catch (error) {
      console.error('Error inserting link:', error);
      showToast('Failed to insert link', 'error');
    }
  };

  const removeSelectedTable = () => {
    let target = selectedTableElementRef.current;
    const editorContainer = document.getElementById('quill-container') as HTMLElement | null;

    if (!target || !document.body.contains(target)) {
      const marked = editorContainer?.querySelector(`.${SELECTED_TABLE_CLASS}`) as HTMLElement | null;
      if (marked) {
        target = marked;
        selectedTableElementRef.current = marked;
      }
    }

    if ((!target || !document.body.contains(target)) && selectedTableIndexRef.current >= 0) {
      const candidates = getSelectableTables(editorContainer);
      const byIndex = candidates[selectedTableIndexRef.current] || null;
      if (byIndex) {
        target = byIndex;
        selectedTableElementRef.current = byIndex;
      }
    }

    if (!target || !document.body.contains(target)) {
      clearTableSelection();
      showToast('Select a table first, then click remove.', 'error');
      return;
    }

    const quill = getQuillInstance();

    if (!quill) {
      showToast('Editor not ready. Please try again.', 'error');
      return;
    }

    target.remove();

    const updatedHtml = quill.root.innerHTML;
    quill.clipboard.dangerouslyPasteHTML(updatedHtml, 'user');
    clearTableSelection();

    showToast('Table removed successfully!', 'success');
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (linkSearchQuery) {
        searchInternalLinks(linkSearchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [linkSearchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchProducts(productSearchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [productSearchQuery]);

  useEffect(() => {
    // Reset and preload products on post switch so insert controls are immediately usable.
    setProductSearchQuery('');
    searchProducts('');
  }, [post?._id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const setupEditor = () => {
      const quill = getQuillInstance();
      if (!quill) {
        if (attempts < 120) {
          attempts += 1;
          timer = setTimeout(setupEditor, 50);
        }
        return;
      }

      const QuillCtor = quill.constructor as any;
      ensureProductBlockBlotRegistered(QuillCtor);

      if (!(quill as any).__productBlockMatcherRegistered) {
        const DeltaCtor = QuillCtor.import('delta');
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node: Node, delta: any) => {
          if (!(node instanceof HTMLElement)) {
            return delta;
          }

          const isProductBlockNode = node.matches('div[data-product-block], div.product-block-blot[data-product-id]');
          if (!isProductBlockNode) {
            return delta;
          }

          const blockType = String(node.getAttribute('data-block-type') || 'accent').toLowerCase() === 'hero' ? 'hero' : 'accent';
          const productId = String(node.getAttribute('data-product-id') || '').trim().toLowerCase();

          if (!productId) {
            return delta;
          }

          const text = String(node.textContent || '').trim();
          const productName = text
            .replace(/^★\s*Hero Card\s*—\s*/i, '')
            .replace(/^Accent Card\s*—\s*/i, '')
            .trim();

          return new DeltaCtor()
            .insert({ [PRODUCT_BLOCK_KEY]: { blockType, productId, productName } })
            .insert('\n');
        });
        (quill as any).__productBlockMatcherRegistered = true;
      }

      const incomingHtml = String(post?.content || '');
      if (incomingHtml && (quill as any).__loadedPostContentId !== post?._id) {
        quill.setText('');
        quill.clipboard.dangerouslyPasteHTML(0, incomingHtml, 'silent');
        contentRef.current = String(quill.root?.innerHTML || incomingHtml);
        (quill as any).__loadedPostContentId = post?._id || 'create';
      }

      // Prevent Ctrl+Z from jumping back to an empty/initial snapshot.
      quill.history?.clear();
      quill.history?.cutoff();
      quillInstanceRef.current = quill;
    };

    timer = setTimeout(setupEditor, 0);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mode, post?._id]);

  useEffect(() => {
    const updateSelectorPosition = (tableElement: HTMLElement) => {
      const rect = tableElement.getBoundingClientRect();
      setTableSelectorUI((prev) => {
        const nextTop = Math.max(8, rect.top - 14);
        const nextLeft = Math.max(8, rect.left - 14);
        if (prev.visible && Math.abs(prev.top - nextTop) < 1 && Math.abs(prev.left - nextLeft) < 1) {
          return prev;
        }

        return {
          visible: true,
          top: nextTop,
          left: nextLeft,
        };
      });
    };

    const hideSelector = () => {
      setTableSelectorUI((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const handleMouseMove = (event: MouseEvent) => {
      const editorRoot = document.querySelector('#quill-container .ql-editor') as HTMLElement | null;
      if (!editorRoot) {
        if (!tableSelectorHoveredRef.current) hideSelector();
        return;
      }

      const tableElement = resolveTableElement(event.target as Node | null);

      if (!tableElement || !editorRoot.contains(tableElement)) {
        hoveredTableElementRef.current = null;
        if (!tableSelectorHoveredRef.current) hideSelector();
        return;
      }

      hoveredTableElementRef.current = tableElement;
      selectorTargetTableRef.current = tableElement;
      updateSelectorPosition(tableElement);
    };

    const handleViewportChange = () => {
      const hovered = hoveredTableElementRef.current;
      if (hovered && document.body.contains(hovered)) {
        updateSelectorPosition(hovered);
        return;
      }

      const selectorTarget = selectorTargetTableRef.current;
      if (selectorTarget && document.body.contains(selectorTarget)) {
        updateSelectorPosition(selectorTarget);
        return;
      }

      if (!tableSelectorHoveredRef.current) {
        hideSelector();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTableSelection();
    };
  }, []);

  const quillModules = {
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true,
    },
    keyboard: {
      bindings: {
        undo: {
          key: 'z',
          shortKey: true,
          handler(this: any) {
            this.quill.history.undo();
          },
        },
        redo: {
          key: 'z',
          shortKey: true,
          shiftKey: true,
          handler(this: any) {
            this.quill.history.redo();
          },
        },
      },
    },
    toolbar: {
      container: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['blockquote'],
        [{ 'table': 'insert-table' }],
        [{ 'internal-link': 'internal-link' }],
      ],
      handlers: {
        'table': function(this: any) {
          const quill = this.quill;
          console.log('Table handler called, quill:', quill);
          
          if (!quill) {
            alert('Editor not ready');
            return;
          }

          // Store quill instance
          quillInstanceRef.current = quill;

          const rows = prompt('Number of rows:', '3');
          const cols = prompt('Number of columns:', '3');

          if (!rows || !cols) return;

          const numRows = parseInt(rows);
          const numCols = parseInt(cols);

          if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
            alert('Invalid table dimensions');
            return;
          }

          // Quill's HTML parser is more reliable with tbody/td than thead/th.
          // Build a first "header" row using bold text inside td cells.
          let tableHTML = '<div class="table-wrapper"><table class="comparison-table"><tbody>';

          tableHTML += '<tr>';
          for (let j = 0; j < numCols; j++) {
            tableHTML += '<td><strong>Header</strong></td>';
          }
          tableHTML += '</tr>';
          
          // Data rows
          for (let i = 0; i < numRows - 1; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < numCols; j++) {
              tableHTML += '<td>Data</td>';
            }
            tableHTML += '</tr>';
          }
          
          tableHTML += '</tbody></table></div>';

          const range = getSafeRange(quill);
          const insertIndex = range ? range.index : 0;
          quill.clipboard.dangerouslyPasteHTML(insertIndex, tableHTML);
          quill.setSelection(insertIndex + 1, 0, 'silent');
          
          console.log('Table inserted');
        },
        'internal-link': function(this: any) {
          const quill = this.quill;
          console.log('Internal link handler called, quill:', quill);
          
          // Store quill instance and current selection for modal
          if (quill) {
            quillInstanceRef.current = quill;
            savedSelectionRef.current = getSafeRange(quill);
            console.log('Stored quill instance and selection:', savedSelectionRef.current);
          }
          
          openInternalLinkModal();
        },
      },
    },
  };

  // Calculate read time from content
  const calculateReadTime = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, '');
    const words = strippedText.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const normalizeEditorContent = (html: string) => {
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/â€“|–/g, '-')
      .replace(/â€”|—/g, '-')
      .replace(/<table[^>]*>/g, '<table>')
      .replace(/<(td|th)[^>]*>/g, '<$1>');
  };

  const readTime = calculateReadTime(contentRef.current || content);

  // Handle tag input
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Save post
  const handleSave = async (publishPost: boolean = false) => {
    const liveContent = String(contentRef.current || '').trim();
    if (!title || !excerpt || !liveContent || !category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);

    const normalizedContent = normalizeEditorContent(liveContent);

    const postData = {
      title,
      slug,
      excerpt,
      content: normalizedContent,
      featuredImage: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      category,
      categoryLabel: categoryOptions.find(c => c.value === category)?.label,
      tags,
      status: publishPost ? 'published' : status,
      publishedAt: publishPost ? new Date().toISOString() : post?.publishedAt,
      readTime: calculateReadTime(normalizedContent),
      featured,
      trending,
      editorsPick,
      seoMetadata: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      },
      cta: {
        enabled: ctaEnabled,
        title: ctaTitle.trim(),
        description: ctaDescription.trim(),
        primaryHref: ctaPrimaryHref.trim(),
        primaryLabel: ctaPrimaryLabel.trim(),
        secondaryHref: ctaSecondaryHref.trim(),
        secondaryLabel: ctaSecondaryLabel.trim(),
      },
    };

    try {
      const url = mode === 'create' ? '/api/posts' : `/api/posts/${post?._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to save post (${response.status})`);
      }

      const data = await response.json();
      setLastSaved(new Date());
      showToast(
        publishPost ? 'Post published successfully!' : 'Post saved successfully!',
        'success'
      );

      if (mode === 'create' && data.post?._id) {
        router.push(`/admin/posts/${data.post._id}/edit`);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      showToast(error?.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-bold z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageUrl(data.url);
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const sanitizeImportedHtml = (rawHtml: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    doc.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((node) => {
      node.remove();
    });

    doc.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();

        if (name.startsWith('on')) {
          element.removeAttribute(attr.name);
          return;
        }

        if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const handleMarkdownUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) return;

    const hasMarkdownExtension = /\.(md|markdown|txt)$/i.test(file.name);
    if (!hasMarkdownExtension && file.type && !file.type.includes('markdown') && !file.type.includes('text')) {
      showToast('Please select a Markdown or text file', 'error');
      inputElement.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Markdown file should be less than 2MB', 'error');
      inputElement.value = '';
      return;
    }

    setMarkdownUploading(true);

    try {
      const markdown = await file.text();
      if (!markdown.trim()) {
        showToast('The selected file is empty', 'error');
        return;
      }

      const html = await marked.parse(markdown, {
        gfm: true,
        breaks: true,
      });
      const sanitizedHtml = sanitizeImportedHtml(html);

      const quill = getQuillInstance();
      if (!quill) {
        showToast('Editor not ready. Please try again.', 'error');
        return;
      }

      quill.setText('');
      quill.clipboard.dangerouslyPasteHTML(0, sanitizedHtml, 'user');
      contentRef.current = String(quill.root?.innerHTML || sanitizedHtml);
      clearTableSelection();
      showToast('Markdown imported into editor', 'success');
    } catch (error) {
      console.error('Markdown import error:', error);
      showToast('Failed to import Markdown file', 'error');
    } finally {
      setMarkdownUploading(false);
      inputElement.value = '';
    }
  };

  return (
    <>
      {/* Internal Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Insert Internal Link</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={linkSearchQuery}
                onChange={(e) => setLinkSearchQuery(e.target.value)}
                placeholder="Search for articles to link..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {linkSearching ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC0000] mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : linkSearchResults.length > 0 ? (
                <div className="space-y-2">
                  {linkSearchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => insertInternalLink(result)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#CC0000] transition-all"
                    >
                      <div className="font-bold text-gray-900 mb-1">{result.title}</div>
                      <div className="text-sm text-gray-500 mb-2">{result.excerpt?.slice(0, 100)}...</div>
                      <div className="text-xs text-[#CC0000] font-medium">
                        {getCanonicalInternalPostPath(result) || '/invalid-post-path'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : linkSearchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  No articles found. Try a different search term.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Start typing to search for articles...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tableSelectorUI.visible && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => {
            tableSelectorHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            tableSelectorHoveredRef.current = false;
            if (!hoveredTableElementRef.current) {
              selectorTargetTableRef.current = null;
              setTableSelectorUI((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }
          }}
          onClick={() => selectTableElement(selectorTargetTableRef.current)}
          className="fixed z-[60] h-7 w-7 rounded-md border border-gray-300 bg-white text-gray-700 shadow-md hover:bg-gray-100"
          style={{ top: tableSelectorUI.top, left: tableSelectorUI.left }}
          title="Select table"
          aria-label="Select table"
        >
          <Move size={14} className="mx-auto" />
        </button>
      )}

      <div className="flex gap-8">
        {/* LEFT COLUMN - Main Editor */}
        <div className="flex-1" style={{ width: '70%' }}>
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post Title"
            className="w-full text-4xl font-black text-[#1a1a1a] mb-4 border-none outline-none focus:ring-0 p-0"
            autoFocus
          />

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
            <p className="text-xs text-gray-500 mt-1">
              ridersection.com/{category || 'category'}/{slug || 'your-post-slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Excerpt <span className="text-gray-400 font-normal">({excerpt.length}/800)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 800))}
              placeholder="Brief description of your post..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-bold text-gray-700">Content</label>
              <label
                htmlFor="markdownUpload"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer"
              >
                <Upload size={14} />
                {markdownUploading ? 'Importing Markdown...' : 'Import Markdown File'}
              </label>
              <input
                id="markdownUpload"
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                onChange={handleMarkdownUpload}
                disabled={markdownUploading}
                className="hidden"
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" id="quill-container">
              <ReactQuillEditor
                ref={quillRef}
                defaultValue={content}
                onChange={handleEditorChange}
                modules={quillModules}
                placeholder="Write your post content here..."
                className="h-[500px]"
                theme="snow"
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <strong>Table:</strong> Click the ⊞ icon in toolbar
              </span>
              <span className="flex items-center gap-1">
                <strong>Internal Link:</strong> Select text, then click the 🔗 icon
              </span>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-gray-500">Use the four-arrow handle to select table</span>
                <button
                  type="button"
                  onClick={removeSelectedTable}
                  disabled={!tableSelected}
                  className={`font-bold ${tableSelected ? 'text-[#CC0000] hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Remove selected table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Settings Panel */}
        <div className="w-[30%]">
          <div className="sticky top-8 space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Status</h3>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1 bg-[#CC0000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#AA0000] transition-colors disabled:opacity-50"
                >
                  Publish
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              {lastSaved && (
                <p className="text-xs text-gray-400 mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Featured Image Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Featured Image</h3>
              
              {imageUrl && (
                <div className="mb-3 relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={imageAlt || 'Featured image preview'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="mb-3">
                <label 
                  htmlFor="imageUpload" 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              />
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Alt text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              />
            </div>

            {/* Product Insert Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Insert Product Blocks</h3>

              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products by name or ASIN"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              />

              <div className="max-h-72 overflow-y-auto space-y-2">
                {productSearching ? (
                  <p className="text-xs text-gray-500">Loading products...</p>
                ) : productSearchResults.length === 0 ? (
                  <p className="text-xs text-gray-500">No products found.</p>
                ) : (
                  productSearchResults.map((product) => {
                    const productName = product.productName || product.name || 'Untitled product';
                    return (
                      <div key={product._id} className="border border-gray-200 rounded-lg p-2">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2">{productName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.price || 'No price'}{product.asin ? ` • ${product.asin}` : ''}
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => insertProductBlock(product, 'accent')}
                            className="w-full border border-gray-400 text-gray-700 text-xs font-bold px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Insert as Accent Card
                          </button>
                          <button
                            type="button"
                            onClick={() => insertProductBlock(product, 'hero')}
                            className="w-full bg-[#CC0000] text-white text-xs font-bold px-2 py-1.5 rounded-md hover:bg-[#AA0000] transition-colors"
                          >
                            Insert as Hero Card ★
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Category & Tags Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Category & Tags</h3>
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              >
                <option value="">Select category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <div className="mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (press Enter or comma)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Settings Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Post Settings</h3>
              
              <label className="flex items-center justify-between mb-3 cursor-pointer">
                <span className="text-sm text-gray-600">Featured Post</span>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
                />
              </label>

              <label className="flex items-center justify-between mb-3 cursor-pointer">
                <span className="text-sm text-gray-600">Trending</span>
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
                />
              </label>

              <label className="flex items-center justify-between mb-3 cursor-pointer">
                <span className="text-sm text-gray-600">Editor's Pick</span>
                <input
                  type="checkbox"
                  checked={editorsPick}
                  onChange={(e) => setEditorsPick(e.target.checked)}
                  className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
                />
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Read Time</span>
                <span className="text-sm font-bold text-gray-900">{readTime} min</span>
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <button
                onClick={() => setSeoCollapsed(!seoCollapsed)}
                className="flex items-center justify-between w-full text-sm font-bold text-gray-700 mb-3"
              >
                SEO Metadata
                {seoCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>

              {!seoCollapsed && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Meta Title ({metaTitle.length}/60)
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                      placeholder={title || 'Meta title'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Meta Description ({metaDescription.length}/160)
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                      placeholder={excerpt || 'Meta description'}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Article CTA</h3>

              <label className="flex items-center justify-between mb-3 cursor-pointer">
                <span className="text-sm text-gray-600">Enable CTA</span>
                <input
                  type="checkbox"
                  checked={ctaEnabled}
                  onChange={(e) => setCtaEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
                />
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  placeholder="CTA heading"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
                <textarea
                  value={ctaDescription}
                  onChange={(e) => setCtaDescription(e.target.value)}
                  placeholder="CTA description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
                />
                <input
                  type="url"
                  value={ctaPrimaryHref}
                  onChange={(e) => setCtaPrimaryHref(e.target.value)}
                  placeholder="Primary button URL"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
                <input
                  type="text"
                  value={ctaPrimaryLabel}
                  onChange={(e) => setCtaPrimaryLabel(e.target.value)}
                  placeholder="Primary button label"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
                <input
                  type="url"
                  value={ctaSecondaryHref}
                  onChange={(e) => setCtaSecondaryHref(e.target.value)}
                  placeholder="Secondary button URL (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
                <input
                  type="text"
                  value={ctaSecondaryLabel}
                  onChange={(e) => setCtaSecondaryLabel(e.target.value)}
                  placeholder="Secondary button label (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
