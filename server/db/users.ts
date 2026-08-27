import { db } from "./client.js";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
};

function fromRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { data, error } = await db
    .from("users")
    .select("id,email,password_hash,name,created_at")
    .eq("email", email)
    .maybeSingle<UserRow>();

  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
}): Promise<UserRecord> {
  const { data, error } = await db
    .from("users")
    .insert({
      email: input.email,
      password_hash: input.passwordHash,
      name: input.name,
    })
    .select("id,email,password_hash,name,created_at")
    .single<UserRow>();

  if (error) throw error;
  return fromRow(data);
}
