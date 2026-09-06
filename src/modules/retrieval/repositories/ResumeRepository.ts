import { ObjectId } from 'mongodb';
import { getDb } from '../../../config/database';
import { env } from '../../../config/env';
import { mapDocToCandidate } from '../utils/candidateMapper';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import { Candidate } from '../types/retrieval.types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', "can't", 'cannot', 'could',
  "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd", "he'll", "he's",
  'her', 'here', "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i', "i'd", "i'll", "i'm",
  "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself', "let's", 'me', 'more', 'most', "mustn't",
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't",
  'so', 'some', 'such', 'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  "there's", 'these', 'they', "they'd", "they'll", "they're", "they've", 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were', "weren't",
  'what', "what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who', "who's", 'whom', 'why', "why's",
  'with', "won't", 'would', "wouldn't", 'you', "you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself',
  'yourselves', 'need', 'want', 'looking', 'experiane', 'experience', 'system', 'systems'
]);

function extractSearchKeywords(query: string): string[] {
  return query
    .split(/\s+/)
    .map((k) => k.replace(/[^A-Za-z0-9+#.-]/g, '').trim())
    .filter((k) => k.length > 1 && !STOP_WORDS.has(k.toLowerCase()));
}

export class ResumeRepository {
  private get collectionName(): string {
    return env.collectionName || 'Resume_Collection';
  }

  async findById(id: string): Promise<Candidate | null> {
    const db = getDb();
    let query: any = { _id: id };

    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const doc = await db.collection(this.collectionName).findOne(query);
    return doc ? mapDocToCandidate(doc) : null;
  }

  async findCandidates(limit = 10): Promise<Candidate[]> {
    const db = getDb();
    const docs = await db
      .collection(this.collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => mapDocToCandidate(doc));
  }

  async searchBM25(
    queryString: string,
    options: { topK?: number; minYearsExperience?: number } = {}
  ): Promise<Candidate[]> {
    const db = getDb();
    const limit = options.topK || 20;
    const indexName = env.bm25IndexName || 'default';

    const matchFilter: any = {};
    if (options.minYearsExperience !== undefined && !isNaN(options.minYearsExperience)) {
      matchFilter.totalExperience = { $gte: options.minYearsExperience, $lte: 50 };
    }


    const keywords = extractSearchKeywords(queryString);
    const cleanSearchQuery = keywords.length > 0 ? keywords.join(' ') : queryString;

    try {
      // Attempt MongoDB Atlas $search (BM25)
      const pipeline: any[] = [
        {
          $search: {
            index: indexName,
            text: {
              query: cleanSearchQuery,
              path: ['rawText', 'skills', 'jobTitles', 'experienceSummary', 'role', 'company'],
            },
          },
        },
      ];

      if (Object.keys(matchFilter).length > 0) {
        pipeline.push({ $match: matchFilter });
      }

      pipeline.push({
        $project: {
          fileName: 1,
          name: 1,
          email: 1,
          phone: 1,
          location: 1,
          company: 1,
          role: 1,
          education: 1,
          totalExperience: 1,
          skills: 1,
          jobTitles: 1,
          experienceSummary: 1,
          score: { $meta: 'searchScore' },
        },
      });

      pipeline.push({ $limit: limit });

      const docs = await db.collection(this.collectionName).aggregate(pipeline).toArray();

      if (docs.length > 0) {
        return docs.map((doc) => {
          const candidate = mapDocToCandidate(doc, doc.score);
          candidate.bm25Score = doc.score;
          return candidate;
        });
      }
    } catch (atlasErr) {
      console.warn('[ResumeRepository] Atlas $search not available or failed, using keyword fallback:', atlasErr);
    }

    // Fallback: Keyword search & weighted scoring pipeline
    if (keywords.length === 0) {
      return this.findCandidates(limit);
    }

    const regexes = keywords.map(
      (k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    );

    const filterQuery: any = {
      $or: [
        { skills: { $in: regexes } },
        { jobTitles: { $in: regexes } },
        { role: { $in: regexes } },
        { experienceSummary: { $in: regexes } },
        { rawText: { $in: regexes } },
      ],
      ...matchFilter,
    };

    const docs = await db
      .collection(this.collectionName)
      .find(filterQuery)
      .limit(limit * 3)
      .toArray();

    const scoredDocs = docs.map((doc) => {
      let score = 0;
      const candidateSkills = Array.isArray(doc.skills) ? doc.skills.join(' ') : '';
      const candidateJobTitles = Array.isArray(doc.jobTitles) ? doc.jobTitles.join(' ') : '';
      const candidateRole = doc.role || '';
      const candidateExpSummary = doc.experienceSummary || '';
      const candidateRawText = doc.rawText || '';

      keywords.forEach((kw) => {
        const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

        // Skills match (weight 5.0)
        const skillsMatches = candidateSkills.match(re);
        if (skillsMatches) score += skillsMatches.length * 5.0;

        // Role & Job Titles match (weight 4.0)
        const roleMatches = candidateRole.match(re);
        if (roleMatches) score += roleMatches.length * 4.0;
        const jobTitleMatches = candidateJobTitles.match(re);
        if (jobTitleMatches) score += jobTitleMatches.length * 4.0;

        // Experience Summary match (weight 2.0)
        const summaryMatches = candidateExpSummary.match(re);
        if (summaryMatches) score += summaryMatches.length * 2.0;

        // Raw Text match (weight 0.5, max 3.0)
        const rawMatches = candidateRawText.match(re);
        if (rawMatches) score += Math.min(rawMatches.length * 0.5, 3.0);
      });

      return { doc, score };
    });

    scoredDocs.sort((a, b) => b.score - a.score);

    return scoredDocs.slice(0, limit).map(({ doc, score }) => {
      const candidate = mapDocToCandidate(doc, score);
      candidate.bm25Score = parseFloat(score.toFixed(4));
      return candidate;
    });
  }


  async searchVector(
    queryVector: number[],
    options: { topK?: number; minYearsExperience?: number } = {}
  ): Promise<Candidate[]> {
    const db = getDb();
    const limit = options.topK || 20;
    const indexName = env.vectorIndexName || 'Resume_Vector_index';

    const matchFilter: any = {};
    if (options.minYearsExperience !== undefined && !isNaN(options.minYearsExperience)) {
      matchFilter.totalExperience = { $gte: options.minYearsExperience, $lte: 50 };
    }


    try {
      // Attempt MongoDB Atlas $vectorSearch
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: indexName,
            path: 'embedding',
            queryVector,
            numCandidates: Math.max(100, limit * 5),
            limit,
          },
        },
      ];

      if (Object.keys(matchFilter).length > 0) {
        pipeline.push({ $match: matchFilter });
      }

      pipeline.push({
        $project: {
          fileName: 1,
          name: 1,
          email: 1,
          phone: 1,
          location: 1,
          company: 1,
          role: 1,
          education: 1,
          totalExperience: 1,
          skills: 1,
          jobTitles: 1,
          experienceSummary: 1,
          vectorScore: { $meta: 'vectorSearchScore' },
        },
      });

      const docs = await db.collection(this.collectionName).aggregate(pipeline).toArray();

      if (docs.length > 0) {
        return docs.map((doc) => {
          const candidate = mapDocToCandidate(doc, doc.vectorScore);
          candidate.vectorScore = doc.vectorScore;
          return candidate;
        });
      }
    } catch (atlasErr) {
      console.warn('[ResumeRepository] Atlas $vectorSearch not available or failed, falling back to cosine rescoring:', atlasErr);
    }

    // Fallback: Exact Cosine Similarity computation
    const filterQuery: any = {
      embedding: { $exists: true, $type: 'array', $ne: [] },
      ...matchFilter,
    };

    const docs = await db.collection(this.collectionName).find(filterQuery).toArray();

    const scoredDocs = docs.map((doc) => {
      const sim = cosineSimilarity(queryVector, doc.embedding || []);
      return { doc, score: sim };
    });

    scoredDocs.sort((a, b) => b.score - a.score);

    return scoredDocs.slice(0, limit).map(({ doc, score }) => {
      const candidate = mapDocToCandidate(doc, score);
      candidate.vectorScore = score;
      return candidate;
    });
  }
}

export const resumeRepository = new ResumeRepository();
