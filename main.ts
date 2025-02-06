import { App, Editor, Plugin } from "obsidian";
import { SummaryPopup } from "./ui/SummaryPopup";

export default class CursorPlugin extends Plugin {
	async onload() {
		console.log("Loading Cursor Plugin...");

		this.addCommand({
			id: "weekly-summary",
			name: "Create Weekly Summary",
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				new SummaryPopup(
					selection,
					editor,
					() => {}
				).show();
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}
}
