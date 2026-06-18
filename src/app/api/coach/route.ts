import { NextRequest } from "next/server";

const SYSTEM_INSTRUCTION = `You are a grandfatherly, elite chess coach who has trained grandmasters. 
Your commentary style is warm, insightful, encouraging, and deeply educational. 
Do not just list moves; instead, explain the positional concepts, tactical patterns, and psychological aspects of the game.

Structure your advice in three concise parts:
1. **The "Why"**: Explain the strategic ideas of the current position, the opponent's threats, and why the recommended best move is chosen.
2. **Mental Framework**: Guide the player on how to mentally evaluate this position (e.g. king safety, pawn structure, space advantage, piece activity).
3. **Calculation Guide**: Tell the player what options or candidate moves they should calculate next, and what to watch out for.

Keep your tone engaging, using grandfatherly wisdom. Do not use overly dry language. Keep it format-rich with markdown, bullet points, and bold text for readability. Keep it concise (around 50-100 words total) so it fits elegantly in the sidebar.`;

// Convert an async generator/iterator to a ReadableStream
function iteratorToStream(iterator: AsyncGenerator<Uint8Array, void, unknown>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* makeIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let lineEndIndex;
      while ((lineEndIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.substring(0, lineEndIndex).trim();
        buffer = buffer.substring(lineEndIndex + 1);

        if (line.startsWith("data:")) {
          const jsonStr = line.substring(5).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              yield new TextEncoder().encode(textChunk);
            }
          } catch (e) {
            console.warn("Failed to parse streaming JSON chunk:", e);
          }
        }
      }
    }

    // Process any remaining text in the buffer
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith("data:")) {
        const jsonStr = line.substring(5).trim();
        try {
          const parsed = JSON.parse(jsonStr);
          const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textChunk) {
            yield new TextEncoder().encode(textChunk);
          }
        } catch (e) {
          // Ignore parse errors on the trailing buffer line
        }
      }
    }
  } catch (error) {
    console.error("Stream reading error:", error);
    yield new TextEncoder().encode("\n\n*Coach connection was lost mid-commentary.*");
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const apiKey = process.env["AI_API_KEY"];
  if (!apiKey) {
    return Response.json(
      { error: "Gemini API key is not configured. Please set the AI_API_KEY environment variable on the server." },
      { status: 500 }
    );
  }

  try {
    const { fen, history, bestMove } = await request.json();

    if (!fen || !bestMove) {
      return Response.json(
        { error: "Missing required parameters: FEN and bestMove are required." },
        { status: 400 }
      );
    }

    const gameHistoryText = history && history.length > 0
      ? history.join(" ")
      : "None (this is the starting position)";

    const userPrompt = `Current board position FEN: ${fen}
Entire game move history: ${gameHistoryText}
Stockfish engine recommended best move for me in this position: ${bestMove}

Please provide your coach analysis and advice for this state.`;

    const modelName = process.env.GEMINI_MODEL;
    if (!modelName) {
      return Response.json(
        { error: "GEMINI_MODEL environment variable is not set. Please set GEMINI_MODEL environment variable on the server." },
        { status: 500 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return Response.json(
        { error: `Gemini API returned an error status ${response.status}.` },
        { status: response.status }
      );
    }

    if (!response.body) {
      return Response.json(
        { error: "Gemini API response body is empty." },
        { status: 500 }
      );
    }

    const reader = response.body.getReader();
    const stream = iteratorToStream(makeIterator(reader));

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API error in coach route:", error);
    return Response.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
