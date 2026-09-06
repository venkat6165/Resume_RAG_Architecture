import path from 'path';
import { connectDatabase, closeDatabase } from '../src/config/database';
import { batchIngestionService } from '../src/modules/ingestion/services/BatchIngestionService';

async function runBatchIngestion() {
  console.log('====================================================');
  console.log('      🚀 Batch Resume Ingestion Workflow 🚀          ');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const customDirIndex = args.findIndex((arg) => !arg.startsWith('--'));
  const targetDir = customDirIndex !== -1
    ? path.resolve(args[customDirIndex])
    : path.resolve(__dirname, '../Resumes');

  console.log(`📁 Target Directory: ${targetDir}`);
  console.log(`🔄 Force Re-ingest: ${force ? 'YES' : 'NO (Skip duplicates)'}`);
  console.log('----------------------------------------------------');

  try {
    console.log('[1/2] Connecting to MongoDB Atlas...');
    await connectDatabase();
    console.log('[2/2] Starting Batch Ingestion Pipeline...\n');

    const summary = await batchIngestionService.ingestDirectory(targetDir, {
      force,
      throttleMs: 150,
      onProgress: (p) => {
        const percent = Math.round((p.current / p.total) * 100);
        const prefix = `[${p.current}/${p.total} ${percent}%]`;

        if (p.status === 'INSERTED') {
          console.log(`✅ ${prefix} INSERTED: "${p.fileName}" (id: ${p.resumeId})`);
        } else if (p.status === 'SKIPPED') {
          console.log(`⏭️  ${prefix} SKIPPED:  "${p.fileName}" (Already stored)`);
        } else if (p.status === 'FAILED') {
          console.error(`❌ ${prefix} FAILED:   "${p.fileName}" - Error: ${p.error}`);
        }
      },
    });

    console.log('\n====================================================');
    console.log('             🎉 BATCH INGESTION SUMMARY 🎉          ');
    console.log('====================================================');
    console.log(`📁 Total Files Found in Dir: ${summary.totalFilesFound}`);
    console.log(`📄 PDF Resumes Filtered:    ${summary.pdfFilesCount}`);
    console.log(`✅ Resumes Newly Ingested:  ${summary.insertedCount}`);
    console.log(`⏭️  Resumes Skipped (Dup):   ${summary.skippedCount}`);
    console.log(`❌ Resumes Failed:          ${summary.failedCount}`);
    console.log(`⏱️  Total Duration:          ${(summary.durationMs / 1000).toFixed(2)}s`);

    if (summary.failedFiles.length > 0) {
      console.log('\n❌ Failed Files Details:');
      summary.failedFiles.forEach((f, idx) => {
        console.log(`   ${idx + 1}. ${f.fileName} -> ${f.error}`);
      });
    }

    console.log('====================================================\n');
  } catch (error: any) {
    console.error('💥 Batch Ingestion Fatal Error:', error?.message || error);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

runBatchIngestion();
