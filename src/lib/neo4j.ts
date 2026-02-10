import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'arkeusconstitution';

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 60000,
    });
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Cluster data types
export interface Cluster {
  id: number;
  category: string;
  title?: string;
  member_count?: number;
}

export interface Chunk {
  id: string;
  chunk_id: string;
  title?: string;
  text_preview?: string;
  content?: string;
  source?: string;
  domain?: string;
  timestamp?: string;
  notion_id?: string;
  cluster?: string;
  domain_score?: number;
}

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: 'cluster' | 'chunk';
    category?: string;
    size?: number;
    memberCount?: number;
    // For chunks
    content?: string;
    source?: string;
    domain?: string;
    timestamp?: string;
  };
}

export interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    type: string;
  };
}

// Get all clusters with their categories
export async function getClusters(): Promise<Cluster[]> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    const result = await session.run(`
      MATCH (cluster:Cluster)
      OPTIONAL MATCH (cluster)<-[:BELONGS_TO]-(chunk:Chunk)
      RETURN
        cluster.id AS id,
        cluster.category AS category,
        cluster.title AS title,
        count(chunk) AS member_count
      ORDER BY cluster.category, cluster.id
    `);

    return result.records.map((record) => ({
      id: record.get('id'),
      category: record.get('category') || 'Unknown',
      title: record.get('title'),
      member_count: record.get('member_count')?.toInt() || 0,
    }));
  } finally {
    await session.close();
  }
}

// Get chunks belonging to a specific cluster
export async function getClusterChunks(clusterId: number): Promise<Chunk[]> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (cluster:Cluster {id: $clusterId})<-[:BELONGS_TO]-(chunk:Chunk)
      RETURN
        chunk.chunk_id AS chunk_id,
        chunk.text_preview AS text_preview,
        chunk.source AS source,
        chunk.domain AS domain,
        chunk.notion_id AS notion_id,
        chunk.cluster AS cluster,
        chunk.domain_score AS domain_score
      LIMIT 500
      `,
      { clusterId }
    );

    return result.records.map((record) => ({
      id: record.get('chunk_id') || '',
      chunk_id: record.get('chunk_id') || '',
      text_preview: record.get('text_preview'),
      source: record.get('source'),
      domain: record.get('domain'),
      notion_id: record.get('notion_id'),
      cluster: record.get('cluster'),
      domain_score: record.get('domain_score'),
    }));
  } finally {
    await session.close();
  }
}

// Search across clusters and chunks
export async function searchGraph(query: string): Promise<{
  clusters: Cluster[];
  chunks: Chunk[];
}> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    // Search clusters
    const clusterResult = await session.run(
      `
      MATCH (cluster:Cluster)
      WHERE toLower(cluster.title) CONTAINS toLower($query)
         OR toLower(cluster.category) CONTAINS toLower($query)
      OPTIONAL MATCH (cluster)<-[:BELONGS_TO]-(chunk:Chunk)
      RETURN
        cluster.id AS id,
        cluster.category AS category,
        cluster.title AS title,
        count(chunk) AS member_count
      LIMIT 50
      `,
      { query }
    );

    const clusters = clusterResult.records.map((record) => ({
      id: record.get('id'),
      category: record.get('category') || 'Unknown',
      title: record.get('title'),
      member_count: record.get('member_count')?.toInt() || 0,
    }));

    // Search chunks
    const chunkResult = await session.run(
      `
      MATCH (chunk:Chunk)
      WHERE toLower(chunk.text_preview) CONTAINS toLower($query)
         OR toLower(chunk.domain) CONTAINS toLower($query)
         OR toLower(chunk.source) CONTAINS toLower($query)
      RETURN
        chunk.chunk_id AS chunk_id,
        chunk.text_preview AS text_preview,
        chunk.source AS source,
        chunk.domain AS domain,
        chunk.notion_id AS notion_id,
        chunk.cluster AS cluster
      LIMIT 50
      `,
      { query }
    );

    const chunks = chunkResult.records.map((record) => ({
      id: record.get('chunk_id') || '',
      chunk_id: record.get('chunk_id') || '',
      text_preview: record.get('text_preview'),
      source: record.get('source'),
      domain: record.get('domain'),
      notion_id: record.get('notion_id'),
      cluster: record.get('cluster'),
    }));

    return { clusters, chunks };
  } finally {
    await session.close();
  }
}

// Get related clusters for a given cluster
export async function getRelatedClusters(clusterId: number): Promise<Cluster[]> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (c1:Cluster {id: $clusterId})-[:RELATED_TO]-(c2:Cluster)
      OPTIONAL MATCH (c2)<-[:BELONGS_TO]-(chunk:Chunk)
      RETURN
        c2.id AS id,
        c2.category AS category,
        c2.title AS title,
        count(chunk) AS member_count
      LIMIT 10
      `,
      { clusterId }
    );

    return result.records.map((record) => ({
      id: record.get('id'),
      category: record.get('category') || 'Unknown',
      title: record.get('title'),
      member_count: record.get('member_count')?.toInt() || 0,
    }));
  } finally {
    await session.close();
  }
}

// Get graph statistics
export async function getGraphStats(): Promise<{
  totalNodes: number;
  totalChunks: number;
  totalClusters: number;
  totalRelationships: number;
}> {
  const driver = getDriver();
  const session: Session = driver.session();

  try {
    const nodeResult = await session.run('MATCH (n) RETURN count(n) AS total');
    const chunkResult = await session.run('MATCH (n:Chunk) RETURN count(n) AS total');
    const clusterResult = await session.run('MATCH (n:Cluster) RETURN count(n) AS total');
    const relResult = await session.run('MATCH ()-[r]->() RETURN count(r) AS total');

    return {
      totalNodes: nodeResult.records[0]?.get('total')?.toInt() || 0,
      totalChunks: chunkResult.records[0]?.get('total')?.toInt() || 0,
      totalClusters: clusterResult.records[0]?.get('total')?.toInt() || 0,
      totalRelationships: relResult.records[0]?.get('total')?.toInt() || 0,
    };
  } finally {
    await session.close();
  }
}
