import { Summary, SummaryAction } from '../types';

export class SummaryColumnComponent {
    static create(summary: Summary, onAction: (action: SummaryAction, summary: Summary) => void): HTMLElement {
        const column = document.createElement("div");
        column.addClass("summary-column");

        const header = this.createHeader(summary, onAction);
        const content = this.createContent(summary);

        column.appendChild(header);
        column.appendChild(content);

        return column;
    }

    private static createHeader(summary: Summary, onAction: (action: SummaryAction, summary: Summary) => void): HTMLElement {
        // ... 创建标题栏的逻辑
    }

    private static createContent(summary: Summary): HTMLElement {
        // ... 创建内容区域的逻辑
    }
}
