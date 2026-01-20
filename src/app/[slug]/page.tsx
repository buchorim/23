import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DocumentDetail } from './DocumentDetail';
import type { Metadata } from 'next';
import type { DocumentWithCategory } from '@/types/database';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getDocument(slug: string): Promise<DocumentWithCategory | null> {
    if (!supabase) {
        console.warn('Supabase client not available');
        return null;
    }

    const { data, error } = await supabase
        .from('documents')
        .select('*, categories(*)')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !data) {
        return null;
    }

    return data as DocumentWithCategory;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const document = await getDocument(slug);

    if (!document) {
        return {
            title: 'Dokumen Tidak Ditemukan - Easy.Store',
        };
    }

    return {
        title: `${document.title} - Easy.Store`,
        description: document.meta_description || `Tutorial ${document.title}`,
    };
}

export default async function DocumentPage({ params }: PageProps) {
    const { slug } = await params;
    const document = await getDocument(slug);

    if (!document) {
        notFound();
    }

    return <DocumentDetail document={document} />;
}
