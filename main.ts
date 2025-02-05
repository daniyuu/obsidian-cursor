import { App, Editor, MarkdownView,  Plugin} from 'obsidian';

export default class CursorPlugin extends Plugin {

	private autocompleteTimer: number | null = null;
	private pendingCompletion: string | null = null;
	private editor: Editor | null = null;
	private isAwaitingInput: boolean = false;
	private completionStartPos: { line: number; ch: number } | null = null; 

	async onload() {
		console.log("Loading Cursor Plugin...");

		// this.registerEvent(this.app.workspace.on("editor-change", this.handleEditorChange.bind(this)));

		// this.registerDomEvent(document, "keydown", (event) => {
		// 	this.handleKeydown(event);
		//   });

		this.addCommand({
			id: 'weekly-summary',
			name: 'Create Weekly Summary',
			editorCallback: async (editor: Editor) => {
				const selection = editor.getSelection();

				const language = 'zh';
				
				const languagePrompt = language === 'zh' 
			? "Please write the summary in Chinese (use Chinese punctuation)."
			: "Please write the summary in English.";
		
		const prompt = `Based on the following content, create a structured weekly summary in markdown format.
Include:
1. A header with the week number
2. Main accomplishments with bullet points and sub-points
3. A summary section with effectiveness, improvements, and next steps

${languagePrompt} Make it clear and actionable.
Here's the content to summarize:
${selection}`;

				const completion = await this.getCpmpletionV2(prompt);
				
				// Get the end position of the selection
				const to = editor.getCursor('to');
				
				// Add two newlines before the summary
				const summaryText = `\n\n${completion}`;
				
				// Insert the summary after the selection
				editor.replaceRange(summaryText, to);
				
				// Optional: Move cursor to the end of the inserted summary
				const newCursorPos = {
					line: to.line + summaryText.split('\n').length,
					ch: 0
				};
				editor.setCursor(newCursorPos);
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}

	handleEditorChange(editor: Editor) { 

		if (this.isAwaitingInput) return;

		if(this.autocompleteTimer) {
			clearTimeout(this.autocompleteTimer);
			this.autocompleteTimer = null;
		}

		this.pendingCompletion = null;

		this.autocompleteTimer = window.setTimeout(async () => {
			const cursor = editor.getCursor();
			const textBeforeCursor = editor.getLine(cursor.line).slice(0, cursor.ch);
			
			console.log(textBeforeCursor);

			// const completion = await this.getCompletion(textBeforeCursor);
			// console.log(completion);

			const completion = "还没有接上API, 但是可以想象, 这是一段自动补全的文字, 点击Alt接受, 点击其他键取消";

			if (completion) {
				this.pendingCompletion = completion;
				this.editor = editor;
				this.isAwaitingInput = true;
				this.completionStartPos = cursor;

				const endPos = { line: cursor.line, ch: cursor.ch + completion.length };
				editor.replaceRange(completion, cursor, cursor, "autocomplete-preview");

			}
		
		}, 2000);

	}

	handleKeydown(event: KeyboardEvent) {

		if(!this.pendingCompletion || !this.editor) return;

		const editor = this.editor;

		if (event.key === "Alt") {
			console.log("Alt key pressed");
			const cursor = editor.getCursor();
			editor.setCursor({ line: cursor.line, ch: cursor.ch + this.pendingCompletion.length });

			this.pendingCompletion = null;
			this.editor = null;
			this.isAwaitingInput = false;
			this.completionStartPos = null;
		} else { 
			if (this.completionStartPos) {
				const start = this.completionStartPos;
				const end = { line: start.line, ch: start.ch + this.pendingCompletion.length };
		
				editor.replaceRange("", start, end, "autocomplete-cancel");
			  }
		
			  this.pendingCompletion = null;
			  this.editor = null;
			  this.isAwaitingInput = false; 
			  this.completionStartPos = null;
		}
	}

	async getCpmpletionV2(prompt: string): Promise<string> {
		const endpoint = "http://127.0.0.1:8000/complete"; // 确保 IP 地址格式正确
		const headers = {
			"Content-Type": "application/json"
		};

		const body = JSON.stringify({
			messages: [{ role: "user", content: prompt }],
			max_tokens: 2048
		});

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers,
				body,
				mode: "cors"  // 确保使用 CORS 模式
			});
			const data = await response.json();
			console.log("Response:", data);
			return data.content;
		} catch (error) {
			console.error("Error fetching chat completion:", error);
		}
		return "Error fetching chat completion";
		
	}

	async getCompletion(prompt: string): Promise<string>{
		const API_KEY ="";

		// implement openai api
		const response = await fetch("https://api.openai.com/v1/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${API_KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: "gpt-4",
				prompt: prompt,
				max_tokens: 100
			})
		});

		const data = await response.json();
		return data.choices.map((c: any) => c.text.trim());

	}


}
