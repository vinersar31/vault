import { NextResponse } from 'next/server';
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  // auth: {
  //   username: process.env.ELASTICSEARCH_USERNAME,
  //   password: process.env.ELASTICSEARCH_PASSWORD,
  // },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const tagsParam = searchParams.get('tags');

  const tags = tagsParam ? tagsParam.split(',') : [];

  const must: any[] = [];
  const filter: any[] = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['title^3', 'content'], // Weight title 3x more than content
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  } else {
    must.push({ match_all: {} });
  }

  if (tags.length > 0) {
    filter.push({
      terms: {
        tags: tags
      }
    });
  }

  try {
    // In newer Elasticsearch JS clients, the "body" wrapper isn't needed.
    // Query, highlight etc are passed directly.
    const result = await client.search({
      index: 'vault-documents',
      query: {
        bool: {
          must,
          filter
        }
      },
      highlight: {
        fields: {
          content: {
            pre_tags: ['<mark class="bg-yellow-200 text-black px-1 rounded">'],
            post_tags: ['</mark>'],
            fragment_size: 150,
            number_of_fragments: 3
          }
        }
      }
    });

    // Handle generic types safely
    const hits = (result.hits.hits || []).map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      source: hit._source,
      highlight: hit.highlight
    }));

    return NextResponse.json({
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value,
      hits
    });
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    return NextResponse.json(
      { error: 'Failed to execute search query' },
      { status: 500 }
    );
  }
}
