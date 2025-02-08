import { Summary, SummaryAction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SummaryManager {
    private summaries: Summary[] = [];
    private listeners: Set<() => void> = new Set();

    addSummary(content: string): Summary {
        const summary = {
            content,
            timestamp: new Date(),
            id: uuidv4()
        };
        this.summaries.push(summary);
        this.notifyListeners();
        return summary;
    }

    deleteSummary(id: string) {
        this.summaries = this.summaries.filter(s => s.id !== id);
        this.notifyListeners();
    }

    getSummaries(): Summary[] {
        return [...this.summaries];
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
} 