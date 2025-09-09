import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

export default class ChatLocal {
  constructor() {
    this.loaded = false;
    this.busy = true;
    this._shouldStop = false;
    this.status = "Unloaded";
  }

  async setup() {
    this.status = "Loading";
      // Get references to our HTML elements
      const status = document.getElementById("status");
      const promptInput = document.getElementById("prompt-input");
      const generateBtn = document.getElementById("generate-btn");
      const output = document.getElementById("output");

      // Use a small model for faster loading
      //const SELECTED_MODEL = "gemma-2b-it-q4f32_1";
      //const SELECTED_MODEL = "Llama-2-7b-chat-hf-q4f32_1";
      const SELECTED_MODEL = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

      // Instantiate the WebLLM engine
      this.engine = await CreateMLCEngine(SELECTED_MODEL, {
          // Provide a callback to track model loading progress
          initProgressCallback: (progress) => {
            this.status = `Loading: ${progress.text}`;
            console.log(JSON.stringify(progress));
              console.log(`Loading: ${progress.text}`);
          }
      });

      // Update UI when the model is ready
      console.log("Model loaded. Ready to chat.");
      this.loaded = true;
      this.busy = false;
      this.status = "Loaded";
      //generateBtn.disabled = false;

        /*
        // Set up the button click event listener
        generateBtn.addEventListener("click", async () => {
            const prompt = promptInput.value;
            if (!prompt) return;

            generateBtn.disabled = true;
            output.textContent = "";
            let currentResponse = "AI: ";

            // Generate a response using the streaming API
            const chunks = await engine.chat.completions.create({
                stream: true,
                messages: [{ "role": "user", "content": prompt }],
            });

            // Process the stream of response chunks
            for await (const chunk of chunks) {
                const delta = chunk.choices[0]?.delta?.content || "";
                currentResponse += delta;
                output.textContent = currentResponse;
            }

            generateBtn.disabled = false;
        });
        */
  }

  async start(prompt, callback) {
            this._shouldStop = false;
            let currentResponse = "";
    const chunks = await this.engine.chat.completions.create({
                stream: true,
                messages: [{ "role": "user", "content": prompt }],
            });

            // Process the stream of response chunks
            for await (const chunk of chunks) {
                if (this._shouldStop) break;
                const delta = chunk.choices[0]?.delta?.content || "";
                currentResponse += delta;
                callback(currentResponse, false);
            }
            callback(currentResponse, true);
  }

  stop() {
    this._shouldStop = true;
  }
}
