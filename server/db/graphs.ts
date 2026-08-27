import { db } from "./client.js";

export type GraphPayload = {
  nodes: unknown[];
  edges: unknown[];
  paramsById: Record<string, unknown>;
  nodeKindById: Record<string, unknown>;
  thumbnail: string | null;
  nodeCount: number;
  edgeCount: number;
  nodeKinds: string[];
};

type GraphRow = {
  id: string;
  user_id: string;
  name: string;
  nodes: unknown[];
  edges: unknown[];
  params_by_id: Record<string, unknown>;
  node_kind_by_id: Record<string, unknown>;
  thumbnail: string | null;
  node_count: number;
  edge_count: number;
  node_kinds: string[];
  created_at: string;
  updated_at: string;
};

const graphColumns =
  "id,user_id,name,nodes,edges,params_by_id,node_kind_by_id,thumbnail,node_count,edge_count,node_kinds,created_at,updated_at";

function toGraph(row: GraphRow) {
  return {
    id: row.id,
    name: row.name,
    nodes: row.nodes,
    edges: row.edges,
    paramsById: row.params_by_id,
    nodeKindById: row.node_kind_by_id,
    thumbnail: row.thumbnail,
    nodeCount: row.node_count,
    edgeCount: row.edge_count,
    nodeKinds: row.node_kinds,
    createdAt: row.created_at,
    savedAt: row.updated_at,
  };
}

export async function listGraphs(userId: string) {
  const { data, error } = await db
    .from("graphs")
    .select("name,thumbnail,node_count,edge_count,node_kinds,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    name: row.name as string,
    thumbnail: (row.thumbnail as string | null) ?? null,
    savedAt: row.updated_at as string,
    nodeCount: row.node_count as number,
    edgeCount: row.edge_count as number,
    nodeKinds: (row.node_kinds as string[]) ?? [],
  }));
}

export async function getGraph(userId: string, name: string) {
  const { data, error } = await db
    .from("graphs")
    .select(graphColumns)
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle<GraphRow>();

  if (error) throw error;
  return data ? toGraph(data) : null;
}

export async function saveGraph(
  userId: string,
  name: string,
  payload: GraphPayload,
) {
  const { error } = await db.from("graphs").upsert(
    {
      user_id: userId,
      name,
      nodes: payload.nodes,
      edges: payload.edges,
      params_by_id: payload.paramsById,
      node_kind_by_id: payload.nodeKindById,
      thumbnail: payload.thumbnail,
      node_count: payload.nodeCount,
      edge_count: payload.edgeCount,
      node_kinds: payload.nodeKinds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,name" },
  );

  if (error) throw error;
}

export async function renameGraph(
  userId: string,
  oldName: string,
  newName: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("graphs")
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("name", oldName)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function deleteGraph(
  userId: string,
  name: string,
): Promise<boolean> {
  const { data, error } = await db
    .from("graphs")
    .delete()
    .eq("user_id", userId)
    .eq("name", name)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
