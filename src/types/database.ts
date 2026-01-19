export type Database = {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    icon: string;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    icon?: string;
                    display_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    icon?: string;
                    display_order?: number;
                    created_at?: string;
                };
            };
            documents: {
                Row: {
                    id: string;
                    category_id: string | null;
                    title: string;
                    slug: string;
                    content: Record<string, unknown>;
                    thumbnail_url: string | null;
                    meta_description: string | null;
                    published: boolean;
                    featured: boolean;
                    display_order: number;
                    settings: DocumentSettings;
                    tags: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    category_id?: string | null;
                    title: string;
                    slug: string;
                    content?: Record<string, unknown>;
                    thumbnail_url?: string | null;
                    meta_description?: string | null;
                    published?: boolean;
                    featured?: boolean;
                    display_order?: number;
                    settings?: DocumentSettings;
                    tags?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    category_id?: string | null;
                    title?: string;
                    slug?: string;
                    content?: Record<string, unknown>;
                    thumbnail_url?: string | null;
                    meta_description?: string | null;
                    published?: boolean;
                    featured?: boolean;
                    display_order?: number;
                    settings?: DocumentSettings;
                    tags?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
};

export interface DocumentSettings {
    showTitle: boolean;
    showCategory: boolean;
    showUpdated: boolean;
    showToc: boolean;
    contentWidth: 'narrow' | 'medium' | 'wide';
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    display_order: number;
    created_at: string;
}

export interface Document {
    id: string;
    category_id: string | null;
    title: string;
    slug: string;
    content: Record<string, unknown>;
    thumbnail_url: string | null;
    meta_description: string | null;
    published: boolean;
    featured: boolean;
    display_order: number;
    settings: DocumentSettings;
    tags: string[];
    created_at: string;
    updated_at: string;
    category?: Category;
}

export interface DocumentWithCategory extends Document {
    categories: Category | null;
}
