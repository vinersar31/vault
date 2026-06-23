const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  // auth: {
  //   username: process.env.ELASTICSEARCH_USERNAME,
  //   password: process.env.ELASTICSEARCH_PASSWORD,
  // },
});

const indexName = 'vault-documents';

async function setupIndex() {
  try {
    const indexExists = await client.indices.exists({ index: indexName });

    if (indexExists) {
      console.log(`Index "${indexName}" already exists. Skipping creation.`);
      return;
    }

    console.log(`Creating index "${indexName}"...`);

    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              partial_match_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'edge_ngram_filter']
              }
            },
            filter: {
              edge_ngram_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20
              }
            }
          }
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'partial_match_analyzer',
              search_analyzer: 'standard'
            },
            content: {
              type: 'text'
            },
            tags: {
              type: 'keyword'
            },
            created_at: {
              type: 'date'
            },
            metadata: {
              type: 'object',
              dynamic: true
            }
          }
        }
      }
    });

    console.log(`Index "${indexName}" created successfully with correct mappings!`);
  } catch (error) {
    console.error('Error creating Elasticsearch index:', error);
    process.exit(1);
  }
}

setupIndex();
