import { Editor } from "obsidian";

export interface Summary {
    content: string;
    timestamp: Date;
    id: string;
}


export interface SummaryAction {
    type: 'accept' | 'delete' | 'regenerate';
    payload?: any;
}

export interface SummaryPanelOptions {
    selectedText: string;
    editor: Editor;
    onClose: () => void;
    language?: string;
} 