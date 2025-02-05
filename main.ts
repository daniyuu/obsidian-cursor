import { App, Editor, MarkdownView, Plugin } from "obsidian";

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
			id: "weekly-summary",
			name: "Create Weekly Summary",
			editorCallback: async (editor: Editor) => {
				const selection = editor.getSelection();

				const language = "zh";

				const languagePrompt =
					language === "zh"
						? "请用中文（使用中文标点）创建一个简洁、高效、有价值的工作周报。避免冗长、空洞的描述，聚焦**实际成果**、**关键挑战**和**下一步行动**。不简单罗列工作内容，而是突出影响和价值。使用'主要完成事项：'作为主要部分的标题。"
						: "Please write the summary in English, focusing on concrete outcomes, challenges, and next steps. Avoid fluff and redundant details. Highlight impact and value.";

				const prompt = `Create an effective weekly work summary that captures key accomplishments, challenges, and insights concisely.  
Focus on **real impact** rather than listing tasks. **Avoid generic statements and unnecessary verbosity**.

If the content includes a specific week number, begin with:
### YYYY - Week N
(e.g., "### 2025 - Week 4")  
Otherwise, omit this header.

**Structure:**
1. Start with "主要完成事项："  
2. **Summarize key accomplishments with tangible impact:**  
- Use numbered points (1., 2., 3.)  
- Include **only meaningful, high-impact work**  
- Avoid unnecessary details—focus on the **why** and **results**  
- Use **bold (**) to emphasize critical terms, projects, or metrics  
3. End with a short summary with three sections:
- **成效：** (What measurable results were achieved?)
- **改进：** (What challenges or lessons were identified?)
- **后续重点：** (What are the next critical actions?)

${languagePrompt}

Here's the content to analyze:
${selection}`;

				const completion = await this.getCpmpletionV2(prompt);

				// Create a popup window with the summary and Accept/Reject buttons
				const popup = document.createElement("div");
				popup.style.position = "fixed";
				popup.style.top = "50%";
				popup.style.left = "50%";
				popup.style.transform = "translate(-50%, -50%)";
				popup.style.backgroundColor = "white";
				popup.style.padding = "20px";
				popup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
				popup.style.zIndex = "1000";

				const summaryText = document.createElement("pre");
				summaryText.textContent = completion;
				popup.appendChild(summaryText);

				const acceptButton = document.createElement("button");
				acceptButton.textContent = "Accept";
				acceptButton.onclick = () => {
					const to = editor.getCursor("to");
					editor.replaceRange(`\n\n${completion}`, to);
					document.body.removeChild(popup);
				};
				popup.appendChild(acceptButton);

				const rejectButton = document.createElement("button");
				rejectButton.textContent = "Reject";
				rejectButton.onclick = () => {
					document.body.removeChild(popup);
				};
				popup.appendChild(rejectButton);

				document.body.appendChild(popup);
			},
		});
	}

	onunload() {
		console.log("Unloading Cursor Plugin...");
	}

	handleEditorChange(editor: Editor) {
		if (this.isAwaitingInput) return;

		if (this.autocompleteTimer) {
			clearTimeout(this.autocompleteTimer);
			this.autocompleteTimer = null;
		}

		this.pendingCompletion = null;

		this.autocompleteTimer = window.setTimeout(async () => {
			const cursor = editor.getCursor();
			const textBeforeCursor = editor
				.getLine(cursor.line)
				.slice(0, cursor.ch);

			console.log(textBeforeCursor);

			// const completion = await this.getCompletion(textBeforeCursor);
			// console.log(completion);

			const completion =
				"还没有接上API, 但是可以想象, 这是一段自动补全的文字, 点击Alt接受, 点击其他键取消";

			if (completion) {
				this.pendingCompletion = completion;
				this.editor = editor;
				this.isAwaitingInput = true;
				this.completionStartPos = cursor;

				const endPos = {
					line: cursor.line,
					ch: cursor.ch + completion.length,
				};
				editor.replaceRange(
					completion,
					cursor,
					cursor,
					"autocomplete-preview"
				);
			}
		}, 2000);
	}

	handleKeydown(event: KeyboardEvent) {
		if (!this.pendingCompletion || !this.editor) return;

		const editor = this.editor;

		if (event.key === "Alt") {
			console.log("Alt key pressed");
			const cursor = editor.getCursor();
			editor.setCursor({
				line: cursor.line,
				ch: cursor.ch + this.pendingCompletion.length,
			});

			this.pendingCompletion = null;
			this.editor = null;
			this.isAwaitingInput = false;
			this.completionStartPos = null;
		} else {
			if (this.completionStartPos) {
				const start = this.completionStartPos;
				const end = {
					line: start.line,
					ch: start.ch + this.pendingCompletion.length,
				};

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
			"Content-Type": "application/json",
		};

		const body = JSON.stringify({
			messages: [{ role: "user", content: prompt }],
			max_tokens: 2048,
		});

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers,
				body,
				mode: "cors", // 确保使用 CORS 模式
			});
			const data = await response.json();
			console.log("Response:", data);
			return data.content;
		} catch (error) {
			console.error("Error fetching chat completion:", error);
		}
		return "Error fetching chat completion";
	}

	async getCompletion(prompt: string): Promise<string> {
		const API_KEY = "";

		// implement openai api
		const response = await fetch("https://api.openai.com/v1/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "gpt-4",
				prompt: prompt,
				max_tokens: 100,
			}),
		});

		const data = await response.json();
		return data.choices.map((c: any) => c.text.trim());
	}
}
