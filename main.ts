import { App, Editor, Plugin } from "obsidian";
import { WeeklySummaryPanel } from "./components/WeeklySummaryPanel";
import { TextAnalysisPanel } from "./components/TextAnalysisPanel";
	
export default class CursorPlugin extends Plugin {
	async onload() {
		console.log("Loading Cursor Plugin...");

		this.addCommand({
			id: "weekly-summary",
			name: "Create Weekly Summary",
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				new WeeklySummaryPanel({
					selectedText: selection,
					editor: editor,
					onClose: () => {}
				}).show();
			},
		});

		this.addCommand({
			id: "text-analysis",
			name: "Analyze Text",
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				new TextAnalysisPanel(
					this.app,
					{
						selectedText: selection,
						editor: editor,
						onClose: () => {}
					}
				).show();
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}
}
