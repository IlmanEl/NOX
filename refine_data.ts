import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';
import cliProgress from 'cli-progress';

// Load environment variables
config();

// Configuration
const CONFIG = {
  inputFile: 'dirty_phrasebook.txt',
  outputFile: 'clean_database.json',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: (process.env.OPENAI_MODEL || 'gpt-4o-mini') as 'gpt-4o' | 'gpt-4o-mini',
  chunkSize: parseInt(process.env.CHUNK_SIZE || '20', 10),
  requestDelay: parseInt(process.env.REQUEST_DELAY_MS || '500', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
};

// System prompt for OpenAI
const SYSTEM_PROMPT = `You are a linguistic expert in the Chechen language (Noxchiyn Mott).
Your task is to correct OCR errors in a phrasebook.
Input format: "Russian phrase | Chechen phrase (with errors)"

RULES FOR CORRECTION:
1. The symbol "1" (palochka) is crucial. Replace 'I', 'l', '!', or '1' with '1' ONLY where it denotes the specific Chechen sound (e.g., г1, к1, п1, т1, х1, ц1, ч1, юь1, я1).
2. Fix pronouns endings: "Са\\"" -> "Сан" (My), "Хьа\\"" -> "Хьан" (Your), "Шу\\"" -> "Шун" (Your pl).
3. Fix verb endings: "хуй1ла" -> "хуьйла", "вой1а" -> "войла".
4. Fix common OCR artifacts: remove random colons (:), fix spacing.
5. Output MUST be a valid JSON object with a "phrases" array: { "phrases": [{ "ru": "...", "ce": "..." }] }.
6. Do NOT translate anew if the meaning is correct, just fix the spelling.`;

// Types
interface PhraseEntry {
  ru: string;
  ce: string;
}

interface ProcessingStats {
  totalChunks: number;
  processedChunks: number;
  totalEntries: number;
  successfulEntries: number;
  failedChunks: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: CONFIG.apiKey,
});

// Utility: Sleep function
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility: Read input file
const readInputFile = (filePath: string): string[] => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

// Utility: Split lines into chunks
const createChunks = (lines: string[], chunkSize: number): string[][] => {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }
  return chunks;
};

// Utility: Load existing progress
const loadExistingProgress = (outputFile: string): PhraseEntry[] => {
  try {
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn('Could not load existing progress, starting fresh');
  }
  return [];
};

// Utility: Save progress
const saveProgress = (outputFile: string, data: PhraseEntry[]): void => {
  try {
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
};

// Process chunk with OpenAI API
const processChunk = async (
  chunk: string[],
  retryCount: number = 0
): Promise<PhraseEntry[]> => {
  try {
    const userPrompt = chunk.join('\n');

    const response = await openai.chat.completions.create({
      model: CONFIG.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse response
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`JSON parse error: ${parseError}`);
    }

    // Handle different response formats
    let entries: PhraseEntry[] = [];
    if (Array.isArray(parsed)) {
      entries = parsed;
    } else if (parsed.phrases && Array.isArray(parsed.phrases)) {
      entries = parsed.phrases;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      entries = parsed.data;
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }

    // Validate entries
    entries = entries.filter(entry => {
      return (
        entry &&
        typeof entry === 'object' &&
        typeof entry.ru === 'string' &&
        typeof entry.ce === 'string' &&
        entry.ru.length > 0 &&
        entry.ce.length > 0
      );
    });

    return entries;
  } catch (error) {
    if (retryCount < CONFIG.maxRetries) {
      console.log(`\nRetrying chunk (attempt ${retryCount + 1}/${CONFIG.maxRetries})...`);
      await sleep(CONFIG.requestDelay * 2);
      return processChunk(chunk, retryCount + 1);
    }
    throw error;
  }
};

// Main processing function
const processPhrasebook = async (): Promise<void> => {
  console.log('🚀 AI-Refinery: Chechen Language Data Cleaning\n');

  // Validate API key
  if (!CONFIG.apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
  }

  // Read input file
  console.log(`📖 Reading input file: ${CONFIG.inputFile}`);
  const lines = readInputFile(CONFIG.inputFile);
  console.log(`   Found ${lines.length} lines`);

  // Create chunks
  const chunks = createChunks(lines, CONFIG.chunkSize);
  console.log(`📦 Split into ${chunks.length} chunks of ${CONFIG.chunkSize} lines each\n`);

  // Load existing progress
  let cleanedData = loadExistingProgress(CONFIG.outputFile);
  const startChunk = Math.floor(cleanedData.length / CONFIG.chunkSize);

  if (startChunk > 0) {
    console.log(`♻️  Resuming from chunk ${startChunk + 1}/${chunks.length}`);
    console.log(`   Already processed: ${cleanedData.length} entries\n`);
  }

  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar(
    {
      format: 'Progress |{bar}| {percentage}% | {value}/{total} chunks | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  progressBar.start(chunks.length, startChunk);

  // Statistics
  const stats: ProcessingStats = {
    totalChunks: chunks.length,
    processedChunks: startChunk,
    totalEntries: cleanedData.length,
    successfulEntries: cleanedData.length,
    failedChunks: 0,
  };

  // Process chunks
  for (let i = startChunk; i < chunks.length; i++) {
    try {
      const entries = await processChunk(chunks[i]);
      cleanedData = cleanedData.concat(entries);

      // Save progress after each chunk
      saveProgress(CONFIG.outputFile, cleanedData);

      stats.processedChunks++;
      stats.successfulEntries += entries.length;
      stats.totalEntries = cleanedData.length;

      progressBar.update(stats.processedChunks);

      // Delay before next request
      if (i < chunks.length - 1) {
        await sleep(CONFIG.requestDelay);
      }
    } catch (error) {
      stats.failedChunks++;
      console.error(`\n❌ Error processing chunk ${i + 1}:`, error);
      console.log('   Continuing with next chunk...\n');
    }
  }

  progressBar.stop();

  // Final save
  saveProgress(CONFIG.outputFile, cleanedData);

  // Print summary
  console.log('\n✅ Processing complete!\n');
  console.log('📊 Statistics:');
  console.log(`   Total chunks: ${stats.totalChunks}`);
  console.log(`   Processed: ${stats.processedChunks}`);
  console.log(`   Failed: ${stats.failedChunks}`);
  console.log(`   Total entries: ${stats.totalEntries}`);
  console.log(`   Output file: ${CONFIG.outputFile}\n`);
};

// Run the script
if (require.main === module) {
  processPhrasebook().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

export { processPhrasebook, processChunk };
