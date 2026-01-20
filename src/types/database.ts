export interface CategoryInsert {
    name: string;
    slug: string;
    icon?: string;
    display_order?: number;
}

export interface CategoryUpdate {
    name?: string;
    slug?: string;
    icon?: string;
    display_order?: number;
}

export interface DocumentInsert {
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
}

export interface DocumentUpdate {
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
}

export interface UserIcon {
    id: string;
    name: string;
    url: string;
    created_at: string;
}

export interface UserIconInsert {
    name: string;
    url: string;
}

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
                Insert: CategoryInsert;
                Update: CategoryUpdate;
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
                Insert: DocumentInsert;
                Update: DocumentUpdate;
            };
            user_icons: {
                Row: UserIcon;
                Insert: UserIconInsert;
                Update: Partial<UserIconInsert>;
            };
            site_settings: {
                Row: {
                    id: string;
                    key: string;
                    value: Record<string, unknown>;
                    updated_at: string;
                };
                Insert: {
                    key: string;
                    value: Record<string, unknown>;
                };
                Update: {
                    key?: string;
                    value?: Record<string, unknown>;
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
